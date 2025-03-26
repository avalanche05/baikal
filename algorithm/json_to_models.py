import json
from typing import List, Dict
from datetime import datetime
import glob
import os
from algorithm.models import SensorConfig, Objects, RowData, RoadSensorLane, Zone, Trigger, Segment, DividingLineObj


def parse_datetime(dt_str: str) -> datetime:
    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S.%f')


length_types = {
    1: 4.7,
    3: 7.1,
    4: 10.9,
}


def convert_json_to_models(json_data: dict) -> List[SensorConfig]:
    """
    Преобразует JSON данные в список моделей SensorConfig
    
    Args:
        json_data (dict): JSON данные
        
    Returns:
        List[SensorConfig]: Список моделей SensorConfig
    """
    # Преобразуем строки времени в объекты datetime
    for obj in json_data.get('objects', []):
        for row in obj.get('rows_data', []):
            if 'time' in row:
                row['time'] = parse_datetime(row['time'])
            if row['obj_length'] == 0:
                row['obj_length'] = length_types.get(row['obj_class'], 0)
    
    # Создаем модель SensorConfig
    sensor_config = SensorConfig(**json_data)
    return [sensor_config]

def process_json_file(file_path: str) -> List[SensorConfig]:
    """
    Обрабатывает один JSON файл и возвращает список моделей
    
    Args:
        file_path (str): Путь к JSON файлу
        
    Returns:
        List[SensorConfig]: Список моделей SensorConfig
    """
    try:
        with open(file_path, 'r') as f:
            json_data = json.load(f)
        return convert_json_to_models(json_data)
    except Exception as e:
        print(f"Ошибка при обработке файла {file_path}: {str(e)}")
        return []
