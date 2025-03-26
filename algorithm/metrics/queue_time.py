import datetime
from collections import deque
from pprint import pprint

from algorithm.json_to_models import main

models = main()

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


def check_heading(angle: int):
    return 160 <= angle <= 200


def is_traffic_lane(lane: int) -> bool:
    return 0 <= lane <= 2


def multiple_stops():
    """calculate time for cars with few stops before traffic lights"""
    for object_frame in models.objects:
        lanes = [[] for _ in range(8)]
        curr_dt = object_frame.rows_data[0].time
        for car in object_frame.rows_data:
            if not is_traffic_lane(car.lane) and check_heading(car.heading):
                continue

            if car.obj_id not in cars:
                cars[car.obj_id] = {
                    "last_speed": 0,
                    "stops_cnt": 0,
                    "last_seen_dt": curr_dt,
                }

            cars[car.obj_id]["last_seen_dt"] = curr_dt

            if cars[car.obj_id]["last_speed"] > 0 and car.obj_speed == 0:
                try:
                    cars[car.obj_id]["stops_cnt"] += 1
                    traffic_jams_car_ids.add(car.obj_id)
                except Exception as err:
                    print(err)
                traffic_jams.append(curr_dt)

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


    # pprint(cars)
    pprint(traffic_jams)
    pprint(traffic_jams_end)


def calc_queue_time():
    for object_frame in models.objects:
        lanes = [[] for _ in range(8)]
        curr_dt = object_frame.rows_data[0].time
        for car in object_frame.rows_data:
            if not is_traffic_lane(car.lane) and check_heading(car.heading):
                continue

            if car.obj_id not in cars_speed:
                cars_speed[car.obj_id] = []

            cars_speed[car.obj_id].append((car.obj_speed, car.lane, car.point_x))

            if car.obj_speed == 0:
                traffic_jams.append(curr_dt)

            lanes[car.lane].append((car.point_x, car.obj_speed, car.obj_id))

        for i in range(4):
            print(i)
            lanes[i].sort(key=lambda x: x[0])
            pprint(lanes[i])
        # print(traffic_jams)

    # pprint(cars_speed)


multiple_stops()
# calc_queue_time()
