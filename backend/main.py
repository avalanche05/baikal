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
get_jam()