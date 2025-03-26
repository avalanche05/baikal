import React, { useEffect, useRef, useState } from 'react';
import './Road.css';

const Road = () => {
    const canvasRef = useRef(null);
    const [trafficLight, setTrafficLight] = useState('red');
    const [cars, setCars] = useState([]);
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const animationFrameRef = useRef(null);

    const LANE_HEIGHT = 60; // Высота полосы
    const ROAD_WIDTH = 800; // Ширина дороги
    const ROAD_HEIGHT = LANE_HEIGHT * 7;
    const TRAFFIC_LIGHT_Y = ROAD_HEIGHT / 2 - 15;
    const CAR_WIDTH = 40;
    const CAR_HEIGHT = 30;
    const DASH_LENGTH = 30;
    const DASH_GAP = 20;
    const SAFE_DISTANCE = 10; // Минимальное расстояние между машинами

    // Функция для проверки наличия машин впереди
    const hasCarAhead = (car, allCars) => {
        const isMovingRight = car.lane < 3;
        const sameLaneCars = allCars.filter((c) => c.lane === car.lane);

        return sameLaneCars.some((aheadCar) => {
            if (isMovingRight) {
                // Проверяем машины впереди
                return aheadCar.x > car.x && aheadCar.x - car.x < CAR_WIDTH + SAFE_DISTANCE;
            } else {
                // Проверяем машины сзади (для машин, движущихся влево)
                return aheadCar.x < car.x && car.x - aheadCar.x < CAR_WIDTH + SAFE_DISTANCE;
            }
        });
    };

    // Функция для обновления позиций машин
    const updateCars = () => {
        setCars((prevCars) => {
            return prevCars
                .map((car) => {
                    const newCar = { ...car };

                    // Определяем направление движения (влево или вправо)
                    const isMovingRight = car.lane < 3;

                    // Проверяем, нужно ли остановиться на светофоре
                    const shouldStopAtLight = isMovingRight
                        ? car.x + CAR_WIDTH > ROAD_WIDTH / 2 - 50 &&
                          car.x < ROAD_WIDTH / 2 + 50 &&
                          trafficLight === 'red'
                        : car.x < ROAD_WIDTH / 2 + 50 &&
                          car.x + CAR_WIDTH > ROAD_WIDTH / 2 - 50 &&
                          trafficLight === 'red';

                    // Проверяем наличие машин впереди
                    const hasCarAheadInLane = hasCarAhead(car, prevCars);

                    if (!shouldStopAtLight && !hasCarAheadInLane) {
                        // Двигаем машину только если нет препятствий
                        newCar.x += isMovingRight ? car.speed : -car.speed;
                    }

                    // Если машина выехала за пределы дороги, удаляем её
                    if (newCar.x < -CAR_WIDTH || newCar.x > ROAD_WIDTH) {
                        return null;
                    }

                    return newCar;
                })
                .filter((car) => car !== null);
        });
    };

    // Функция для отрисовки прерывистой линии
    const drawDashedLine = (ctx, startX, startY, endX, endY, dashLength, gapLength) => {
        const dx = endX - startX;
        const dy = endY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const dashCount = Math.floor(distance / (dashLength + gapLength));

        for (let i = 0; i < dashCount; i++) {
            const start = i * (dashLength + gapLength);
            const dashStart = {
                x: startX + (dx * start) / distance,
                y: startY + (dy * start) / distance,
            };
            const dashEnd = {
                x: startX + (dx * (start + dashLength)) / distance,
                y: startY + (dy * (start + dashLength)) / distance,
            };

            ctx.beginPath();
            ctx.moveTo(dashStart.x, dashStart.y);
            ctx.lineTo(dashEnd.x, dashEnd.y);
            ctx.stroke();
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Устанавливаем размеры canvas
        canvas.width = ROAD_WIDTH;
        canvas.height = ROAD_HEIGHT;

        // Функция для отрисовки дороги
        const drawRoad = () => {
            // Фон дороги
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, ROAD_WIDTH, ROAD_HEIGHT);

            // Настройка стиля линий
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;

            // Отрисовка прерывистых линий для нижней стороны (3 полосы)
            for (let i = 1; i < 3; i++) {
                drawDashedLine(
                    ctx,
                    0,
                    i * LANE_HEIGHT,
                    ROAD_WIDTH,
                    i * LANE_HEIGHT,
                    DASH_LENGTH,
                    DASH_GAP
                );
            }

            // Сплошная разделительная линия посередине
            ctx.beginPath();
            ctx.moveTo(0, 3 * LANE_HEIGHT);
            ctx.lineTo(ROAD_WIDTH, 3 * LANE_HEIGHT);
            ctx.stroke();

            // Отрисовка прерывистых линий для верхней стороны (3 полосы)
            for (let i = 4; i < 7; i++) {
                drawDashedLine(
                    ctx,
                    0,
                    i * LANE_HEIGHT,
                    ROAD_WIDTH,
                    i * LANE_HEIGHT,
                    DASH_LENGTH,
                    DASH_GAP
                );
            }

            // Светофор
            ctx.fillStyle = trafficLight;
            ctx.fillRect(ROAD_WIDTH / 2 - 15, TRAFFIC_LIGHT_Y, 30, 30);
        };

        // Функция для отрисовки машин
        const drawCars = () => {
            cars.forEach((car) => {
                ctx.fillStyle = car.color;
                ctx.fillRect(car.x, car.y, CAR_WIDTH, CAR_HEIGHT);
            });
        };

        // Функция анимации
        const animate = () => {
            if (!isSimulationRunning) return;

            ctx.clearRect(0, 0, ROAD_WIDTH, ROAD_HEIGHT);
            drawRoad();
            drawCars();
            updateCars();
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (isSimulationRunning) {
            animate();
        }

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [trafficLight, cars, isSimulationRunning]);

    // Функция для добавления новой машины
    const addCar = () => {
        const lane = Math.floor(Math.random() * 7);
        const isMovingRight = lane < 3;
        const newCar = {
            id: Date.now(),
            x: isMovingRight ? -CAR_WIDTH : ROAD_WIDTH,
            y: lane * LANE_HEIGHT + (LANE_HEIGHT - CAR_HEIGHT) / 2,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            speed: 0.1,
            lane: lane,
        };
        setCars((prev) => [...prev, newCar]);
    };

    // Функция для переключения светофора
    const toggleTrafficLight = () => {
        setTrafficLight((prev) => (prev === 'red' ? 'green' : 'red'));
    };

    // Функция для запуска/остановки симуляции
    const toggleSimulation = () => {
        setIsSimulationRunning((prev) => !prev);
    };

    return (
        <div className='road-container'>
            <div className='controls'>
                <button onClick={addCar}>Добавить машину</button>
                <button onClick={toggleTrafficLight}>Переключить светофор</button>
                <button onClick={toggleSimulation}>
                    {isSimulationRunning ? 'Остановить' : 'Запустить'} симуляцию
                </button>
            </div>
            <canvas ref={canvasRef} className='road-canvas' />
        </div>
    );
};

export default Road;
