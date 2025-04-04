import datetime
from collections import deque
from pprint import pprint

from backend.data_loader import get_all_objects

objects = get_all_objects()

STOP_TIME_THRESHOLD_SECS = 5
AVG_STOPS_VALUE_THRESHOLD_MIN = 3

traffic_jams = []  # starts of
traffic_jams_end = []  # ends of
lanes = [[] for _ in range(8)]  # (point_x, speed, id)
cars = dict()
cars_speed = dict()
traffic_jams_car_ids = set()


def has_left(curr_dt: datetime.datetime, last_seen_dt: datetime.datetime) -> bool:
    """car is no longer displayed within the sensor"""
    time_diff = curr_dt - last_seen_dt
    seconds = time_diff.total_seconds()

    return seconds >= 10.0


def check_heading(angle: int) -> bool:
    return 160 <= angle <= 200

def check_x(x: int) -> bool:
    return x > 30


def is_traffic_lane(lane: int) -> bool:
    return 0 <= lane <= 2


def calc_avg_stops_count(curr_dt: datetime.datetime, avg_sum: float, stops: deque, car_ids: list[int]) -> float:
    if not stops or not car_ids:
        return 0.0

    while len(stops) and stops[0][0] < curr_dt - datetime.timedelta(minutes=AVG_STOPS_VALUE_THRESHOLD_MIN):
        avg_sum -= 1
        stops.popleft()
    
    real_stops = []
    for stop in stops:
        if stop[1] in car_ids:
            real_stops.append(stop[1])

    return len(real_stops) / len(car_ids)


def get_all_car_stops_by_id(car_id: int) -> None:
    stops = []
    for object_frame in objects:
        curr_dt = object_frame.rows_data[0].time
        for car in object_frame.rows_data:
            if car.obj_id == car_id and car.obj_speed == 0:
                stops.append(curr_dt)

    pprint(stops)


def avg_multiple_stops():
    """calculate time for cars with few stops before traffic lights"""
    general_stops_sum, general_cars_sum = 0, 0
    d = set()
    stops = deque()
    result = []
    for object_frame in objects:
        lanes = [[] for _ in range(8)]
        curr_dt = object_frame.rows_data[0].time
        for car in object_frame.rows_data:
            if not is_traffic_lane(car.lane) or not check_heading(car.heading) or not check_x(car.point_x):
                new_stops = []
                for stop in stops:
                    if stop[1] != car.obj_id:
                        new_stops.append(stop)
                    else:
                        general_stops_sum -= 1
                stops = deque(new_stops)
                if car.obj_id in cars:
                    del cars[car.obj_id]
                continue

            # старый id привязан к новой машине, не успели почистить
            if car.obj_id in cars and abs(cars[car.obj_id]["last_point_x"] - car.point_x) >= 100:
                del cars[car.obj_id]

            if car.obj_id not in cars:
                cars[car.obj_id] = {
                    "last_speed": 0,
                    "stops_cnt": 0,
                    "last_seen_dt": curr_dt,
                    "last_stop_dt": None,
                    "last_point_x": car.point_x,
                    "last_point_x_stop": None,
                    "counted": False,
                }

            cars[car.obj_id]["last_seen_dt"] = curr_dt

            # машина останавливается в первый раз
            if car.obj_speed == 0 \
                        and (cars[car.obj_id]["last_speed"] > 0 or cars[car.obj_id]["last_speed"] is None):
                cars[car.obj_id]["last_stop_dt"] = curr_dt
                cars[car.obj_id]["last_point_x_stop"] = car.point_x

            # все еще стоит какое-то время. считаем за остановку
            if car.obj_speed == 0 and cars[car.obj_id]["last_stop_dt"] is not None and not cars[car.obj_id]["counted"] \
                    and (curr_dt - cars[car.obj_id]["last_stop_dt"]).total_seconds() > STOP_TIME_THRESHOLD_SECS:
                cars[car.obj_id]["stops_cnt"] += 1
                cars[car.obj_id]["counted"] = True
                traffic_jams_car_ids.add(car.obj_id)
                traffic_jams.append(curr_dt)
                stops.append((cars[car.obj_id]["last_stop_dt"], car.obj_id))
                general_stops_sum += 1
                d.add(car.obj_id)

            # начала двигаться после остановки
            if car.obj_speed > 1.0 and cars[car.obj_id]["counted"]:
                cars[car.obj_id]["counted"] = False
                cars[car.obj_id]["last_stop_dt"] = None
                cars[car.obj_id]["last_point_x_stop"] = None

            cars[car.obj_id]["last_speed"] = car.obj_speed

        ids_to_delete = []
        for car_id, car_data in cars.items():
            last_seen_dt = car_data["last_seen_dt"]
            if has_left(curr_dt, last_seen_dt):
                ids_to_delete.append(car_id)

        for car_id in ids_to_delete:
            if car_id in traffic_jams_car_ids:
                traffic_jams_end.append(curr_dt)
                traffic_jams_car_ids.remove(car_id)
            del cars[car_id]

        avg_stops_sum = calc_avg_stops_count(curr_dt, general_stops_sum, stops, cars.keys())
        if avg_stops_sum > 50:
            print([t for t in cars.keys()])
        result.append((object_frame.rows_data[0].time, avg_stops_sum))
    return result


if __name__ == "__main__":
    avg_multiple_stops()
