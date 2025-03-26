export interface DividingLineObj {
    follow_index: number;
    follow_index_number: number;
    lane_draw_index: number;
    lane_index: number;
    sensor_id: string;
    width: number;
}

export interface RowData {
    heading: number;
    lane: number;
    obj_class: number;
    obj_id: number;
    obj_length: number;
    obj_speed: number;
    obj_speed_mps: number;
    obj_width: number;
    point_x: number;
    point_y: number;
    quality: number;
    sensor_id: string;
    time: string;
    uuid: string;
}

export interface RowsObject {
    name: string;
    protocol_version: string;
    rows: number;
    rows_data: RowData[];
}

export interface Segment {
    index: number;
    x: number;
    y: number;
}

export interface Trigger {
    classes: number;
    lane_index: number;
    max_range: null;
    max_speed: null;
    max_time: null;
    min_range: null;
    min_speed: null;
    min_time: null;
    predefined_type: null;
    relay_id: null;
    road_sensor_triggers_id: null;
    sensor_id: string;
    trigger_index: null;
    zone_id: string;
    zone_index: number;
}

export interface Zone {
    blink: boolean;
    cars: [null];
    classes: number;
    direction: number;
    drag_x: number;
    drag_y: number;
    features: string[];
    fragments_quantity: number;
    lane_index: number;
    length: number;
    road_sensor_zones_id: string;
    roads_id: string;
    rotation: number;
    segments: Segment[];
    segments_count: number;
    sensor_id: string;
    trigger: Trigger;
    width: number;
    zone_draw_index: number;
    zone_index: number;
    zone_lane_order: number;
    zone_offset: number;
    zone_order: number;
}

export interface RoadSensorLane {
    active: boolean;
    align: string;
    center: number;
    direction: number;
    dividing_line: boolean;
    index_number: number;
    is_dataware: boolean;
    lane_draw_index: number;
    lane_index: number;
    length: number;
    ln: number;
    old_width: number;
    range_offset: number;
    road_sensor_lanes_id: string;
    sensor_id: string;
    splines: number[][];
    splines_count: number;
    width: number;
    zones: Zone[];
}

export interface TypeName {
    code: string;
    name: {
        en: string;
        es: string;
        ru: string;
    };
}

export interface SensorType {
    type: string;
    type_name: TypeName;
}

export interface Radar {
    adapter_v: string;
    bezier_curves: number;
    blind_zone: number;
    blind_zone2: number;
    blind_zone_left: number;
    blind_zone_right: number;
    calibration_factor: number;
    command_port: number;
    dividing_line_obj: DividingLineObj;
    firmware: string;
    frequency_band: number;
    hold_time: number;
    layer_rotation: number;
    mounting_height: number;
    ntp_server: string;
    objects: RowsObject[];
    offset_x: number;
    offset_y: number;
    port: number;
    road_sensor_lanes: RoadSensorLane[];
    road_sensor_params: null;
    road_sensor_zones: Zone[];
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    sensitivity: number;
    sensitivity_two: number;
    sensor_ip: string;
    sensor_mode: number;
    sensor_pch: number;
    sensor_road_direction: number;
    sensor_road_type: number;
    sensor_type: SensorType;
    type: string;
    type_name: TypeName;
    xM: number;
    yM: number;
}
