export interface Boundary {
    time: string;
    lanes: Lane[];
}

export interface Lane {
    laneId: number;
    carStartId: number | null;
    carEndId: number | null;
    queueLength: number;
    queueDuration: number;
    flowSpeed: number;
    delay: number;
}
