import os
from datetime import datetime
from typing import List, Dict, Tuple
from algorithm.models import Objects
from algorithm.json_to_models import process_json_file
import logging

# Настраиваем логирование
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()  # Добавляем вывод в консоль
    ]
)
logger = logging.getLogger(__name__)

# Кэш для хранения данных
queue_data_cache = None

def get_all_objects() -> List[Objects]:
    # Путь к директории с данными
    data_dir = '/home/ilinivan/baikal/algorithm/data'
    logger.info(f"Чтение данных из директории: {data_dir}")
    
    # Получаем список всех файлов и сортируем их по времени
    files = []
    for filename in os.listdir(data_dir):
        if filename.endswith('.json'):
            # Извлекаем дату и время из имени файла
            # Формат: YYYY-MM-DD_HH-MM-SS.json
            try:
                date_str = filename.replace('.json', '')
                timestamp = datetime.strptime(date_str[len('Олимпийский'):], '%d_%m_%Y_%H_%M')
                files.append((timestamp, filename))
                logger.info(f"Найден файл с данными: {filename}")
            except ValueError:
                logger.exception(f"Не удалось распарсить дату из имени файла: {filename}")
                continue
    
    # Сортируем файлы по времени
    files.sort(key=lambda x: x[0])
    logger.info(f"Найдено {len(files)} файлов с данными")
    
    # Объединяем все objects
    all_objects = []
    for _, filename in files:
        file_path = os.path.join(data_dir, filename)
        sc = process_json_file(file_path)[0]
        all_objects.extend(sc.objects)
        logger.info(f"Загружено {len(sc.objects)} объектов из файла {filename}")
    
    logger.info(f"Всего загружено {len(all_objects)} объектов")
    return all_objects

def calculate_metrics(rows: List[dict], start_time: datetime, end_time: datetime) -> Tuple[float, float, float]:
    """
    Рассчитывает метрики для пробки:
    - queue_length: длина пробки в метрах
    - flow_speed: скорость потока в м/с
    - delay: задержка в секундах
    """
    if not rows:
        return 0.0, 0.0, 0.0
    
    # Находим первую и последнюю машину в пробке
    start_car = None
    end_car = None
    
    for row in rows:
        if start_time <= row['time'] <= end_time:
            if row['obj_speed'] == 0:  # Машина в пробке
                if start_car is None:
                    start_car = row
                end_car = row
    
    if start_car is None or end_car is None:
        return 0.0, 0.0, 0.0
    
    # Рассчитываем длину пробки
    queue_length = abs(end_car['point_x'] - start_car['point_x'])
    
    # Рассчитываем среднюю скорость потока
    total_speed = sum(row['obj_speed'] for row in rows if row['obj_speed'] > 0)
    moving_cars = sum(1 for row in rows if row['obj_speed'] > 0)
    flow_speed = total_speed / moving_cars if moving_cars > 0 else 0
    
    # Рассчитываем задержку
    delay = (end_time - start_time).total_seconds()
    
    return queue_length, flow_speed, delay

def get_queue_boundaries(start: datetime, stop: datetime) -> Dict[int, List[Tuple[datetime, ]]]:
    """
    Возвращает список границ пробок для каждой полосы в заданном временном промежутке.
    Каждая граница - это кортеж (время начала, время окончания, длина пробки, скорость потока, задержка).
    """
    global queue_data_cache
    
    logger.info(f"Запрос границ пробок для периода: {start} - {stop}")
    
    # Если кэш пуст, загружаем данные
    if queue_data_cache is None:
        logger.info("Кэш пуст, загружаем данные...")
        from algorithm.q import calculate_queue_meters
        all_objects = get_all_objects()
        queue_data_cache = calculate_queue_meters(all_objects)
        logger.info("Данные загружены в кэш")
    
    
    boundaries = {lane: [] for lane in range(3)}
    for lane in range(3):  # 0, 1, 2
        starts = queue_data_cache[lane]['starts']
        ends = queue_data_cache[lane]['ends']
        
        for i in range(len(starts)):
            if starts[i] and ends[i] and starts[i].time >= start and starts[i].time <= stop:
                boundaries[lane].append((starts[i], ends[i], queue_data_cache[lane]['ts'][i]))
            elif starts[i] is None or ends[i] is None:
                boundaries[lane].append((None, None, queue_data_cache[lane]['ts'][i]))
       
    
    return boundaries