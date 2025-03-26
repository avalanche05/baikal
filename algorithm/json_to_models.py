import json
from typing import List, Dict
from datetime import datetime
import glob
import os
from models import SensorConfig, Objects, RowData, RoadSensorLane, Zone, Trigger, Segment, DividingLineObj

def parse_datetime(dt_str: str) -> datetime:
    return datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S.%f')

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

def main():
    # Путь к директории с JSON файлами
    json_dir = "algorithm/data"
    
    # Получаем список всех JSON файлов
    json_files = ['/home/ilinivan/baikal/algorithm/data/Олимпийский20_03_2025_17_31.json']
    # json_files = glob.glob(os.path.join(json_dir, "*.json"))
    
    # if not json_files:
    #     print("JSON файлы не найдены в текущей директории")
    #     return
    
    all_models = []
    
    # Обрабатываем каждый файл
    for json_file in json_files:
        print(f"\nОбработка файла: {json_file}")
        models = process_json_file(json_file) # на наших данных здесь всегда длина 1. Он нам как раз и нужен
        all_models.append(models)
    
    # Объединяем все модели
    merged_model = all_models[0][0]
    # Выводим информацию о объединенной модели
    print("\nОбъединенная модель:")
    print(f"Тип сенсора: {merged_model.sensor_type.type}")
    print(f"IP адрес: {merged_model.sensor_ip}")
    print(f"Количество полос: {len(merged_model.road_sensor_lanes)}")
    print(f"Общее количество объектов: {len(merged_model.objects)}")
    print("-" * 50)

if __name__ == "__main__":
    main() 