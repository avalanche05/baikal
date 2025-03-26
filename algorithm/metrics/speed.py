import datetime

from algorithm.json_to_models import main

models = main()
cars = dict()
ids = set()


standard_time_seconds = 12  # 200 m / 60 km p h

# class Car:
#     def __init__(self, lane):
#         self.lane = lane


def has_left(curr_dt: datetime.datetime, last_seen_dt: datetime.datetime) -> bool:
    time_diff = curr_dt - last_seen_dt
    seconds = time_diff.total_seconds()

    return seconds >= 30.0


def calculate_time(curr_dt: datetime.datetime, first_seen_dt: datetime.datetime) -> float:
    """from first time of stop to current time"""
    time_diff = curr_dt - first_seen_dt
    seconds = time_diff.total_seconds()

    return seconds


def is_traffic_lane(lane: int) -> bool:
    return 0 <= lane <= 2


def car_time(car_id):
    min_dt = datetime.datetime(2070, 1, 1)
    max_dt = datetime.datetime(1970, 1, 1)

    for object_frame in models.objects:
        for car in object_frame.rows_data:
            if car.obj_id == car_id:
                min_dt = min(min_dt, car.time)
                max_dt = max(max_dt, car.time)

    return min_dt, max_dt


def get_max_point_x():
    x_max = 0
    x_min = 10000
    for object_frame in models.objects:
        for car in object_frame.rows_data:
            if is_traffic_lane(car.lane):
                x_max = max(car.point_x, x_max)
                x_min = min(car.point_x, x_min)

    return x_min, x_max


def avg_speed(rows_data: list) -> float:
    return sum(rows_data) / len(rows_data)


def check_heading(angle: int):
    return 160 <= angle <= 200


def calc_time_diff(models) -> None:
    avg_delay_time = 0
    std_delay_time = 0

    for object_frame in models.objects:
        curr_dt = object_frame.rows_data[0].time
        for car in object_frame.rows_data:
            lanes = [0] * 7

            if not is_traffic_lane(car.lane) and check_heading(car.heading):
                continue

            if car.obj_id not in cars:
                cars[car.obj_id] = {
                    "from_beginning": False,
                    "time_entries": []
                }

            if car.point_x >= 200:
                cars[car.obj_id]["from_beginning"] = True
            if car.point_x <= 200:
                cars[car.obj_id]["time_entries"].append((car.time, car.obj_speed, car.lane))

            if car.obj_speed == 0:
                ids.add(car.obj_id)

        sum_delay, sum_cars = 0, 0
        ids_to_delete = []

        for car_id, car_data in cars.items():
            from_beginning = car_data["from_beginning"]
            car = car_data["time_entries"]
            if car:
                first_seen_dt = car[0][0]
                last_seen_dt = car[-1][0]

                if has_left(curr_dt, last_seen_dt):
                    if from_beginning and is_traffic_lane(car[0][2]):
                        time_diff = calculate_time(last_seen_dt, first_seen_dt)
                        if time_diff > standard_time_seconds:
                            # print(time_diff, car[0][2], car_id)
                            delay = time_diff - standard_time_seconds
                            sum_delay += delay
                            # print('del ', delay, sum_delay)
                            sum_cars += 1

                    ids_to_delete.append(car_id)

        for car_id in ids_to_delete:
            del cars[car_id]

        if sum_cars:
            avg_delay_time = sum_delay / (sum_cars if sum_cars else 1)
            print("avg_delay_time", avg_delay_time)


# print(cars)
calc_time_diff(models)
print(ids)
print(car_time(car_id=67))
print(get_max_point_x())
# avg_delay_time, sum_delay_time, std_delay_time


