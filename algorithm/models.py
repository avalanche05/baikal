from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


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
    max_range: Optional[Union[float, int]] = Field(default=None)
    max_speed: Optional[Union[float, int]] = Field(default=None)
    max_time: Optional[Union[float, int]] = Field(default=None)
    min_range: Optional[Union[float, int]] = Field(default=None)
    min_speed: Optional[Union[float, int]] = Field(default=None)
    min_time: Optional[Union[float, int]] = Field(default=None)
    predefined_type: Optional[str] = Field(default=None)
    relay_id: Optional[str] = Field(default=None)
    road_sensor_triggers_id: Optional[str] = Field(default=None)
    sensor_id: str
    trigger_index: Optional[Union[int, str]] = Field(default=None)
    zone_id: str
    zone_index: int


class Segment(BaseModel):
    index: int
    x: Union[float, int]
    y: Union[float, int]


class Zone(BaseModel):
    blink: bool
    cars: List[Optional[Any]]
    classes: int
    direction: int
    drag_x: Union[float, int]
    drag_y: Union[float, int]
    features: List[str]
    fragments_quantity: int
    lane_index: int
    length: Union[float, int]
    road_sensor_zones_id: str
    roads_id: str
    rotation: Union[float, int]
    segments: List[Segment]
    segments_count: int
    sensor_id: str
    trigger: Trigger
    width: Union[float, int]
    zone_draw_index: int
    zone_index: int
    zone_lane_order: int
    zone_offset: Union[float, int]
    zone_order: int


class RoadSensorLane(BaseModel):
    active: bool
    align: str
    center: Union[float, int]
    direction: int
    dividing_line: bool
    index_number: int
    is_dataware: bool
    lane_draw_index: int
    lane_index: int
    length: Union[float, int]
    ln: Union[float, int]
    old_width: Union[float, int]
    range_offset: Union[float, int]
    road_sensor_lanes_id: Optional[str] = None
    sensor_id: str
    splines: List[List[Union[int, float]]]
    splines_count: int
    width: Union[float, int]
    zones: List[Zone]


class DividingLineObj(BaseModel):
    follow_index: int
    follow_index_number: int
    lane_draw_index: int
    lane_index: int
    sensor_id: str
    width: Union[float, int]


class RowData(BaseModel):
    heading: Union[float, int]
    lane: int
    obj_class: int
    obj_id: int
    obj_length: Union[float, int]
    obj_speed: Union[float, int]
    obj_speed_mps: Union[float, int]
    obj_width: Union[float, int] = Field(default=0.0)
    point_x: Union[float, int] = Field(default=0.0)
    point_y: Union[float, int] = Field(default=0.0)
    quality: int = Field(default=0)
    sensor_id: str
    time: Union[datetime, str]
    uuid: str = Field(default_factory=lambda: str(uuid.uuid4()))


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
    offset_x: Union[float, int]
    offset_y: Union[float, int]
    port: int
    road_sensor_lanes: List[RoadSensorLane]
    road_sensor_params: Optional[Any] = Field(default=None)
    road_sensor_zones: List[Zone]
    rotateX: Union[float, int]
    rotateY: Union[float, int]
    rotateZ: Union[float, int]
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
    xM: Union[float, int]
    yM: Union[float, int]
