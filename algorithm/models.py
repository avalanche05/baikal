from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class Name(BaseModel):
    code: str
    name: Dict[str, str]


class TypeName(BaseModel):
    code: str
    name: Dict[str, str]


class SensorType(BaseModel):
    type: str
    type_name: TypeName


class Trigger(BaseModel):
    classes: int
    lane_index: int
    max_range: Optional[float] = None
    max_speed: Optional[float] = None
    max_time: Optional[float] = None
    min_range: Optional[float] = None
    min_speed: Optional[float] = None
    min_time: Optional[float] = None
    predefined_type: Optional[str] = None
    relay_id: Optional[str] = None
    road_sensor_triggers_id: Optional[str] = None
    sensor_id: str
    trigger_index: Optional[int] = None
    zone_id: str
    zone_index: int


class Segment(BaseModel):
    index: int
    x: float
    y: float


class Zone(BaseModel):
    blink: bool
    cars: List[Optional[Any]]
    classes: int
    direction: int
    drag_x: float
    drag_y: float
    features: List[str]
    fragments_quantity: int
    lane_index: int
    length: float
    road_sensor_zones_id: str
    roads_id: str
    rotation: float
    segments: List[Segment]
    segments_count: int
    sensor_id: str
    trigger: Trigger
    width: float
    zone_draw_index: int
    zone_index: int
    zone_lane_order: int
    zone_offset: float
    zone_order: int


class RoadSensorLane(BaseModel):
    active: bool
    align: str
    center: float
    direction: int
    dividing_line: bool
    index_number: int
    is_dataware: bool
    lane_draw_index: int
    lane_index: int
    length: float
    ln: float
    old_width: float
    range_offset: float
    road_sensor_lanes_id: str
    sensor_id: str
    splines: List[List[int]]
    splines_count: int
    width: float
    zones: List[Zone]


class DividingLineObj(BaseModel):
    follow_index: int
    follow_index_number: int
    lane_draw_index: int
    lane_index: int
    sensor_id: str
    width: float


class RowData(BaseModel):
    heading: float
    lane: int
    obj_class: int
    obj_id: int
    obj_length: float
    obj_speed: float
    obj_speed_mps: float
    obj_width: float
    point_x: float
    point_y: float
    quality: int
    sensor_id: str
    time: datetime
    uuid: str


class Objects(BaseModel):
    name: str
    protocol_version: str
    rows: int
    rows_data: List[RowData]


class SensorConfig(BaseModel):
    adapter_v: str
    bezier_curves: int
    blind_zone: int
    blind_zone2: int
    blind_zone_left: int
    blind_zone_right: int
    calibration_factor: int
    command_port: int
    dividing_line_obj: DividingLineObj
    firmware: str
    frequency_band: int
    hold_time: int
    layer_rotation: int
    mounting_height: int
    ntp_server: str
    objects: List[Objects]
    offset_x: int
    offset_y: float
    port: int
    road_sensor_lanes: List[RoadSensorLane]
    road_sensor_params: Optional[Any] = None
    road_sensor_zones: List[Zone]
    rotateX: int
    rotateY: int
    rotateZ: int
    sensitivity: int
    sensitivity_two: int
    sensor_ip: str
    sensor_mode: int
    sensor_pch: int
    sensor_road_direction: int
    sensor_road_type: int
    sensor_type: SensorType
    type: str
    type_name: TypeName
    xM: int
    yM: int 