from algorithm.models import RowData, Objects

LANES = [0, 1, 2]

def separate_row_by_lane(rows: list[RowData]):
    rows_by_lane = {lane: [] for lane in LANES}
    for row in rows:
        if row.lane in rows_by_lane:
            rows_by_lane[row.lane].append(row) 
    return rows_by_lane

def get_queue_start(rows: list[RowData]) -> RowData | None:
    for row in rows:
        if row.obj_speed == 0:
            return row
    return None

def get_queue_end(rows: list[RowData]) -> RowData | None:
    is_started = False
    for row in rows:
        if row.obj_speed == 0:
            is_started = True
        elif is_started:
            return row
    if is_started:
        return rows[-1]
    return None


def is_car_going(row_data: RowData)

cars = dict()
def calculate_queue_meters(objects: list[Objects]):
    result = {lane: {'starts': [], 'ends': [], 'ts': []} for lane in LANES}
    for obj in objects:
        rows_by_lane = separate_row_by_lane(obj.rows_data)
        for lane, rows in rows_by_lane.items():
            start = get_queue_start(rows)
            end = get_queue_end(rows)
            if start and end:
                result[lane]['starts'].append(start)
                result[lane]['ends'].append(end)
                result[lane]['ts'].append(rows[0].time)
            elif rows:
                result[lane]['starts'].append(None)
                result[lane]['ends'].append(None)
                result[lane]['ts'].append(rows[0].time)
    return result
