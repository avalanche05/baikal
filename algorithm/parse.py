import json
from pprint import pprint

def read_json_file(file_path):
    """
    Открывает и считывает файл JSON, возвращает данные в виде словаря.

    :param file_path: Путь к файлу JSON.
    :return: Данные, считанные из JSON файла.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as json_file:
            data = json.load(json_file)
            return data
    except FileNotFoundError:
        print(f"Файл не найден: {file_path}")
    except json.JSONDecodeError:
        print(f"Ошибка декодирования JSON в файле: {file_path}")
    except Exception as e:
        print(f"Произошла ошибка: {e}")


# Пример использования функции
file_path = 'data/Олимпийский20_03_2025_17_31.json'
data = read_json_file(file_path)
def foo(d: dict) -> dict:
    if isinstance(d, list):
        d = [foo(d[0] if d else None)]
    if not isinstance(d, dict):
        return d
    res = dict()
    for k, v in d.items():
        if isinstance(v, list):
            n = [foo(v[0] if v else None)]
        else:
            n = foo(v)
        res[k] = n
    return res

with open("o.json", 'w', encoding='utf-8') as writer:
    # json.dump(data, writer)
    # for data_t in data:
    #     print(data_t)
    pprint(foo(data), writer)