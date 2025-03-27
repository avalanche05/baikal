import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from typing import List, Tuple
import sys
import os

# Добавляем путь к корневой директории
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from algorithm.metrics.avg_stops_count import avg_multiple_stops

def plot_avg_stops():
    # Получаем данные
    data = avg_multiple_stops()
    
    # Разделяем данные на временные метки и значения
    timestamps = [item[0] for item in data]
    avg_stops = [item[1] for item in data]
    
    # Создаем график
    plt.figure(figsize=(12, 6))
    
    # Рисуем линию
    plt.plot(timestamps, avg_stops, 'b-', linewidth=2)
    
    # Настройка графика
    plt.title('Среднее количество остановок на светофоре', fontsize=14)
    plt.xlabel('Время', fontsize=12)
    plt.ylabel('Среднее количество тактов', fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # Форматирование оси времени
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%H:%M:%S'))
    plt.gcf().autofmt_xdate()  # Автоматический поворот меток времени
    
    # Сохранение графика
    plt.savefig('static/avg_stops_plot.png', dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == "__main__":
    plot_avg_stops() 