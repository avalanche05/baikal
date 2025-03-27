from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
import sys
import os
import logging

import json
# Настраиваем логирование
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Добавляем вывод в консоль
    ]
)
logger = logging.getLogger(__name__)

# Добавляем путь к корневой директории
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from backend.data_loader import get_queue_boundaries

app = FastAPI(
    title="Traffic Jam API",
    description="API для получения информации о пробках",
    version="1.0.0"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все источники
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

class Lane(BaseModel):
    laneId: int
    carStartId: int | None = None
    carEndId: int | None = None
    queueLength: float  # длина пробки в метрах
    queueDuration: float  # длительность пробки в секундах
    flowSpeed: float  # скорость потока в м/с
    delay: float  # задержка в секундах

class Boundary(BaseModel):
    time: datetime
    lanes: List[Lane]

    model_config = {
        "json_encoders": {
            datetime: lambda v: v.isoformat()
        }
    }

class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

def get_jam():
    """
    Возвращает список границ пробок для каждой полосы в заданном временном промежутке.
    Каждая граница содержит время и список полос с информацией о пробках.
    """
    # logger.info(f"Получен запрос на получение данных о пробках за период: {start} - {stop}")
    data = get_queue_boundaries(datetime(year=1970, month=1, day=1), datetime(year=2100, month=1, day=1))
    boundaries = []
    for i in range(len(data[0])):
        lanes = []
        boundaries.append(
                Boundary(
                    time=data[0][i][2],
                    lanes=[])
            )
        for lane in range(3):
            lanes.append(Lane(
                laneId=lane,
                carStartId=data[lane][i][0].obj_id if data[lane][i][0] else None,
                carEndId=data[lane][i][1].obj_id if data[lane][i][1] else None,
                queueLength=abs(data[lane][i][1].point_x - data[lane][i][0].point_x) if data[lane][i][1] and data[lane][i][0] else 0,
                queueDuration=0,
                flowSpeed=0,
                delay=0))
        boundaries[-1].lanes = lanes
    with open('boundaries.json', 'w') as f:
        json.dump([t.model_dump() for t in boundaries], f, cls=DateTimeEncoder)


def drow_front_back():
    start_time = datetime(2025, 3, 20, 14, 20, 0)
    end_time = datetime(2025, 3, 20, 14, 25, 0)
    
    data = get_queue_boundaries(start_time, end_time)
    
    import matplotlib.pyplot as plt
    import matplotlib.dates as mdates
    
    # Создаем график для каждого lane
    for lane_id in range(len(data)):
        # Подготовка данных
        timestamps = []
        start_points = []
        end_points = []
        
        for start, end, ts in data[lane_id]:
            timestamps.append(ts)
            start_points.append(start.point_x if start else 0)
            end_points.append(end.point_x if end else 0)
        
        # Создание графика
        plt.figure(figsize=(12, 6))
        
        # Добавление линий без маркеров
        plt.plot(timestamps, start_points, 'b-', label=f'Lane {lane_id} Start', linewidth=2)
        plt.plot(timestamps, end_points, 'r-', label=f'Lane {lane_id} End', linewidth=2)
        
        # Настройка графика
        plt.title(f'Lane {lane_id} Data (14:20-14:25)', fontsize=14)
        plt.xlabel('Time', fontsize=12)
        plt.ylabel('Point X', fontsize=12)
        plt.grid(True, linestyle='--', alpha=0.7)
        plt.legend(fontsize=10)
        
        # Установка границ по оси X
        plt.xlim(start_time, end_time)
        
        # Форматирование оси времени
        plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M:%S'))
        plt.gcf().autofmt_xdate()  # Автоматический поворот меток времени
        
        # Сохранение графика
        plt.savefig(f'static/lane_{lane_id}_plot.png', dpi=300, bbox_inches='tight')
        plt.close()  # Закрываем график для освобождения памяти
        
        # Логируем создание графика
        logger.info(f"Created plot for lane {lane_id}")
drow_front_back()