export interface Boundary {
    id: number;
    time: string;
    lanes: Lane[];
}

export interface Lane {
    laneId: number;
    carStartId: number;
    carEndId: number;
    queueLength: number;
    queueDuration: number;
    flowSpeed: number;
    delay: number;
}
