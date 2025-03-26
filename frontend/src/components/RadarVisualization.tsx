import React, { useEffect, useRef, useState } from 'react';
import { Radar } from '../models/radar';
import { Boundary } from '../models/boundaries';
import './RadarVisualization.css';

interface Point {
    x: number;
    y: number;
    speed: number;
    obj_id: number;
    heading: number;
    lane: number;
    obj_class: number;
    obj_length: number;
    obj_width: number;
}

interface TimeFrame {
    time: number;
    points: Point[];
    boundary?: Boundary;
}

interface RadarVisualizationProps {
    radarData: Radar;
}

interface RoadSensorLane {
    lane_index: number;
    range_offset: number;
    width: number;
}

export const RadarVisualization: React.FC<RadarVisualizationProps> = ({ radarData }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
    const [scale, setScale] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [gridBounds, setGridBounds] = useState<{
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    } | null>(null);
    const [timeFrames, setTimeFrames] = useState<TimeFrame[]>([]);
    const [boundaries, setBoundaries] = useState<Boundary[]>([]);

    // Обработчики событий мыши для drag and drop
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - offset.x,
            y: e.clientY - offset.y,
        });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDragging) return;

        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    // Преобразуем данные в удобный формат для анимации
    useEffect(() => {
        if (!radarData.objects?.length) return;

        // Собираем все временные метки
        const allTimes = radarData.objects.map((obj) => new Date(obj.rows_data[0].time).getTime());
        const minTime = Math.min(...allTimes);
        const maxTime = Math.max(...allTimes);

        // Разбиваем время на отрезки по 100мс
        const timeStep = 100;
        const frames: TimeFrame[] = [];

        // Сортируем объекты по времени
        const sortedObjects = [...radarData.objects].sort(
            (a, b) =>
                new Date(a.rows_data[0].time).getTime() - new Date(b.rows_data[0].time).getTime()
        );

        // Сортируем границы по времени
        const sortedBoundaries = [...boundaries].sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );

        for (let time = minTime; time <= maxTime; time += timeStep) {
            // Находим объект, который ближе всего к текущему времени
            let closestObject = sortedObjects[0];
            let minTimeDiff = Infinity;

            for (const obj of sortedObjects) {
                const objTime = new Date(obj.rows_data[0].time).getTime();
                const timeDiff = Math.abs(objTime - time);

                if (timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    closestObject = obj;
                }
            }

            // Находим границы, которые ближе всего к текущему времени
            let closestBoundary = sortedBoundaries[0];
            let minBoundaryTimeDiff = Infinity;

            for (const boundary of sortedBoundaries) {
                const boundaryTime = new Date(boundary.time).getTime();
                const timeDiff = boundaryTime - time; // Используем разницу без модуля

                // Ищем границу, которая ближе всего к текущему времени, но не в будущем
                if (timeDiff >= 0 && timeDiff < minBoundaryTimeDiff) {
                    minBoundaryTimeDiff = timeDiff;
                    closestBoundary = boundary;
                }
            }

            // Если не нашли границу в будущем, берем последнюю из прошлого
            if (!closestBoundary || minBoundaryTimeDiff === Infinity) {
                closestBoundary = sortedBoundaries[sortedBoundaries.length - 1];
            }

            if (closestObject) {
                const points = closestObject.rows_data.map((row) => ({
                    x: row.point_x,
                    y: row.point_y,
                    speed: row.obj_speed,
                    obj_id: row.obj_id,
                    heading: row.heading,
                    lane: row.lane,
                    obj_class: row.obj_class,
                    obj_length: row.obj_length,
                    obj_width: row.obj_width,
                }));

                frames.push({
                    time,
                    points,
                    boundary: closestBoundary,
                });

                // Логируем данные для каждого кадра
                console.log(`Кадр ${frames.length - 1}:`, {
                    time: new Date(time).toISOString(),
                    objectTime: closestObject.rows_data[0].time,
                    timeDiff: minTimeDiff,
                    pointsCount: points.length,
                    boundaryTime: closestBoundary
                        ? new Date(closestBoundary.time).toISOString()
                        : null,
                    boundaryTimeDiff: minBoundaryTimeDiff,
                    boundary: closestBoundary
                        ? {
                              lanes: closestBoundary.lanes.map((l) => ({
                                  laneId: l.laneId,
                                  carStartId: l.carStartId,
                                  carEndId: l.carEndId,
                                  queueLength: l.queueLength,
                                  queueDuration: l.queueDuration,
                                  flowSpeed: l.flowSpeed,
                                  delay: l.delay,
                              })),
                          }
                        : null,
                    points: points.map((p) => ({
                        id: p.obj_id,
                        x: p.x,
                        y: p.y,
                        speed: p.speed,
                    })),
                });
            }
        }

        console.log('Преобразованные данные:', {
            framesCount: frames.length,
            timeRange: {
                min: new Date(minTime).toISOString(),
                max: new Date(maxTime).toISOString(),
            },
            timeStep,
            boundariesCount: boundaries.length,
            boundariesTimeRange:
                boundaries.length > 0
                    ? {
                          min: new Date(
                              Math.min(...boundaries.map((b) => new Date(b.time).getTime()))
                          ).toISOString(),
                          max: new Date(
                              Math.max(...boundaries.map((b) => new Date(b.time).getTime()))
                          ).toISOString(),
                      }
                    : null,
        });

        setTimeFrames(frames);

        // Вычисляем границы сетки
        const allPoints = frames.flatMap((frame) => frame.points);
        let minX = Infinity;
        let maxX = -Infinity;
        const minY = -15; // Фиксированный диапазон по Y
        const maxY = 15;

        for (const point of allPoints) {
            if (!isNaN(point.x)) {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
            }
        }

        // Проверяем, что мы нашли валидные границы по X
        if (isFinite(minX) && isFinite(maxX)) {
            const padding = 50;
            setGridBounds({
                minX: minX - padding,
                maxX: maxX + padding,
                minY,
                maxY,
            });
        } else {
            // Если не нашли валидные границы, используем значения по умолчанию
            console.log('Используем значения по умолчанию для границ сетки');
            setGridBounds({
                minX: -100,
                maxX: 100,
                minY,
                maxY,
            });
        }

        console.log('Вычисленные границы сетки:', {
            minX,
            maxX,
            minY,
            maxY,
            pointsCount: allPoints.length,
        });
    }, [radarData, boundaries]);

    // Загрузка данных о границах
    useEffect(() => {
        const loadBoundaries = async () => {
            try {
                const response = await fetch('/src/assets/boundaries.json');
                const data = await response.json();
                setBoundaries(data);
            } catch (err) {
                console.error('Ошибка загрузки границ:', err);
            }
        };
        loadBoundaries();
    }, []);

    // Функция для отрисовки полос движения
    const drawLanes = (
        ctx: CanvasRenderingContext2D,
        minX: number,
        minY: number,
        maxX: number,
        maxY: number,
        finalScale: number
    ) => {
        try {
            // Получаем информацию о полосах из данных
            const lanes = radarData.road_sensor_lanes || [];

            // Сортируем полосы по смещению
            const sortedLanes = [...lanes].sort((a, b) => a.range_offset - b.range_offset);

            // Находим максимальную ширину дороги для расчета фона
            const maxLaneOffset = Math.max(...lanes.map((lane) => Math.abs(lane.range_offset)));
            const maxLaneWidth = Math.max(...lanes.map((lane) => lane.width));
            const roadHeight = (maxLaneOffset * 2 + maxLaneWidth) * finalScale;

            // Рисуем фон дороги на всю видимую ширину
            const roadY = (0 - minY) * finalScale - (roadHeight * finalScale) / 2;
            ctx.fillStyle = '#E5E5E5';
            ctx.fillRect(0, roadY, ctx.canvas.width, roadHeight * finalScale);

            // Рисуем каждую полосу
            sortedLanes.forEach((lane) => {
                const y = lane.range_offset;
                const screenY = (y - minY) * finalScale;

                // Основная линия полосы
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, screenY);
                ctx.lineTo(ctx.canvas.width, screenY);
                ctx.stroke();

                // Добавляем подпись полосы
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'left';
                ctx.fillText(`Полоса ${lane.lane_index}`, 10, screenY - 5);
            });
        } catch (err) {
            console.error('Ошибка отрисовки полос:', err);
        }
    };

    // Функция для отрисовки светофора
    const drawTrafficLight = (
        ctx: CanvasRenderingContext2D,
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
        finalScale: number
    ) => {
        try {
            const x = (28 - minX) * finalScale; // Перемещаем светофор на x=50
            const y = (0 - minY) * finalScale; // Размещаем на уровне дороги

            // Рисуем опору светофора
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.4; // Уменьшаем толщину линии
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - 6 * finalScale); // Уменьшаем высоту опоры
            ctx.stroke();

            // Рисуем корпус светофора
            ctx.fillStyle = '#333';
            ctx.fillRect(
                x - 1.6 * finalScale,
                y - 12 * finalScale,
                3.2 * finalScale,
                8 * finalScale
            );

            // Рисуем сигналы светофора
            const signals = ['#ff0000', '#ffff00', '#00ff00'];
            signals.forEach((color, index) => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(
                    x,
                    y - 10 * finalScale + index * 3 * finalScale,
                    0.8 * finalScale,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            });
        } catch (err) {
            console.error('Ошибка отрисовки светофора:', err);
        }
    };

    // Функция для отрисовки перпендикулярной дороги
    const drawPerpendicularRoad = (
        ctx: CanvasRenderingContext2D,
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
        finalScale: number
    ) => {
        try {
            const roadWidth = 20; // ширина дороги в метрах
            const roadLength = 100; // длина дороги в метрах

            // Рисуем фон дороги
            ctx.fillStyle = '#E5E5E5';
            ctx.fillRect(
                (0 - minX) * finalScale - (roadWidth * finalScale) / 2,
                (0 - minY) * finalScale - (roadLength * finalScale) / 2,
                roadWidth * finalScale,
                roadLength * finalScale
            );

            // Рисуем разметку дороги
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(
                (0 - minX) * finalScale,
                (0 - minY) * finalScale - (roadLength * finalScale) / 2
            );
            ctx.lineTo(
                (0 - minX) * finalScale,
                (0 - minY) * finalScale + (roadLength * finalScale) / 2
            );
            ctx.stroke();

            // Рисуем пунктирную линию посередине
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(
                (0 - minX) * finalScale,
                (0 - minY) * finalScale - (roadLength * finalScale) / 2
            );
            ctx.lineTo(
                (0 - minX) * finalScale,
                (0 - minY) * finalScale + (roadLength * finalScale) / 2
            );
            ctx.stroke();
            ctx.setLineDash([]); // Сбрасываем пунктир
        } catch (err) {
            console.error('Ошибка отрисовки перпендикулярной дороги:', err);
        }
    };

    // Функция для отрисовки линейки с расстоянием
    const drawRuler = (
        ctx: CanvasRenderingContext2D,
        minX: number,
        maxX: number,
        minY: number,
        maxY: number,
        finalScale: number
    ) => {
        try {
            const startX = 28; // Начальная точка (светофор)
            const endX = startX + 300; // Конечная точка (300 метров вправо)
            const y = 0; // Уровень дороги

            // Рисуем риски и подписи каждые 10 метров
            for (let x = startX; x <= endX; x += 10) {
                const screenX = (x - minX) * finalScale;
                const screenY = (y - minY) * finalScale;

                // Добавляем подпись расстояния
                ctx.fillStyle = '#000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText((x - startX).toString(), screenX, screenY + 15 * finalScale);
            }
        } catch (err) {
            console.error('Ошибка отрисовки линейки:', err);
        }
    };

    // Функция для отрисовки границ пробки
    const drawQueueBoundaries = (
        ctx: CanvasRenderingContext2D,
        lane: RoadSensorLane,
        currentFrame: TimeFrame,
        minX: number,
        minY: number,
        finalScale: number
    ) => {
        if (!currentFrame.boundary) return;

        const laneBoundary = currentFrame.boundary.lanes.find((b) => b.laneId === lane.lane_index);
        if (!laneBoundary) return;

        const laneY = lane.range_offset;
        const screenY = (laneY - minY) * finalScale;
        const laneHeight = 3.8 * finalScale;

        // Рисуем линию очереди между началом и концом
        if (laneBoundary.carStartId && laneBoundary.carEndId) {
            const startCar = currentFrame.points.find((p) => p.obj_id === laneBoundary.carStartId);
            const endCar = currentFrame.points.find((p) => p.obj_id === laneBoundary.carEndId);
            if (startCar && endCar) {
                // Рисуем фон затора
                ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
                ctx.fillRect(
                    (startCar.x - minX) * finalScale,
                    screenY - laneHeight / 2,
                    (endCar.x - startCar.x) * finalScale,
                    laneHeight
                );

                // Рисуем линию затора
                ctx.beginPath();
                ctx.moveTo((startCar.x - minX) * finalScale, screenY);
                ctx.lineTo((endCar.x - minX) * finalScale, screenY);
                ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
                ctx.lineWidth = laneHeight;
                ctx.stroke();

                // Добавляем пунктирную линию
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.moveTo((startCar.x - minX) * finalScale, screenY);
                ctx.lineTo((endCar.x - minX) * finalScale, screenY);
                ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Рисуем маркеры начала и конца очереди
        if (laneBoundary.carStartId) {
            const car = currentFrame.points.find((p) => p.obj_id === laneBoundary.carStartId);
            if (car) {
                const x = (car.x - minX) * finalScale;
                ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
                ctx.fillRect(x - 5, screenY - laneHeight / 2, 10, laneHeight);
                // Добавляем обводку
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 5, screenY - laneHeight / 2, 10, laneHeight);
            }
        }
        if (laneBoundary.carEndId) {
            const car = currentFrame.points.find((p) => p.obj_id === laneBoundary.carEndId);
            if (car) {
                const x = (car.x - minX) * finalScale;
                ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
                ctx.fillRect(x - 5, screenY - laneHeight / 2, 10, laneHeight);
                // Добавляем обводку
                ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x - 5, screenY - laneHeight / 2, 10, laneHeight);
            }
        }
    };

    // Анимация
    useEffect(() => {
        if (!isPlaying || !canvasRef.current || !timeFrames.length) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) {
            setError('Не удалось получить контекст canvas');
            return;
        }

        let animationFrameId: number;
        const startTime = performance.now();
        const timeScale = 100; // Уменьшаем масштаб времени до 100мс
        let lastUpdateTime = startTime;

        const animate = (timestamp: number) => {
            if (!isPlaying) {
                return;
            }

            try {
                const elapsedTime = timestamp - lastUpdateTime;
                if (elapsedTime >= timeScale) {
                    const nextIndex = currentTimeIndex + 1;

                    if (nextIndex >= timeFrames.length) {
                        setIsPlaying(false);
                        setCurrentTimeIndex(0);
                        return;
                    }

                    setCurrentTimeIndex(nextIndex);
                    drawPoints(ctx, timeFrames);
                    lastUpdateTime = timestamp;
                }

                animationFrameId = requestAnimationFrame(animate);
            } catch (err) {
                setError('Ошибка при анимации');
                console.error('Ошибка анимации:', err);
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isPlaying, timeFrames, currentTimeIndex]);

    // Функция для отрисовки точек на canvas
    const drawPoints = (ctx: CanvasRenderingContext2D, frames: TimeFrame[]) => {
        try {
            // Очищаем весь canvas
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Применяем трансформацию для перемещения
            ctx.save();
            ctx.translate(offset.x, offset.y);

            if (!gridBounds) {
                console.log('Нет границ сетки, используем значения по умолчанию');
                return;
            }

            const { minX, maxX, minY, maxY } = gridBounds;

            // Проверяем, что границы валидны
            if (isNaN(minX) || isNaN(maxX) || isNaN(minY) || isNaN(maxY)) {
                console.log('Некорректные границы сетки, используем значения по умолчанию');
                return;
            }

            const scaleX = ctx.canvas.width / (maxX - minX);
            const scaleY = ctx.canvas.height / (maxY - minY);
            const finalScale = Math.min(scaleX, scaleY) * scale;

            // Рисуем перпендикулярную дорогу
            drawPerpendicularRoad(ctx, minX, maxX, minY, maxY, finalScale);

            // Рисуем полосы движения
            drawLanes(ctx, minX, minY, maxX, maxY, finalScale);

            // Рисуем светофор
            drawTrafficLight(ctx, minX, maxX, minY, maxY, finalScale);

            // Рисуем линейку с расстоянием
            drawRuler(ctx, minX, maxX, minY, maxY, finalScale);

            // Получаем текущий кадр
            const currentFrame = frames[currentTimeIndex];
            if (!currentFrame) {
                console.log('Нет данных для текущего кадра:', {
                    currentTimeIndex,
                    framesCount: frames.length,
                });
                return;
            }

            // Рисуем границы пробок
            radarData.road_sensor_lanes?.forEach((lane) => {
                drawQueueBoundaries(ctx, lane, currentFrame, minX, minY, finalScale);
            });

            // Отрисовываем траектории
            currentFrame.points.forEach((point) => {
                const trajectory = frames
                    .slice(0, currentTimeIndex + 1)
                    .flatMap((frame) => frame.points)
                    .filter((p) => p.obj_id === point.obj_id);

                if (trajectory.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(
                        (trajectory[0].x - minX) * finalScale,
                        (trajectory[0].y - minY) * finalScale
                    );

                    for (let i = 1; i < trajectory.length; i++) {
                        ctx.lineTo(
                            (trajectory[i].x - minX) * finalScale,
                            (trajectory[i].y - minY) * finalScale
                        );
                    }

                    ctx.strokeStyle = `hsla(${point.speed * 10}, 70%, 50%, 0.3)`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });

            // Отрисовываем точки поверх траекторий
            currentFrame.points.forEach((point) => {
                const x = (point.x - minX) * finalScale;
                const y = (point.y - minY) * finalScale;

                // Вычисляем размеры прямоугольника
                const length = point.obj_length || 4.5;
                const width = 2; // Фиксированная ширина
                const screenLength = length * finalScale;
                const screenWidth = width * finalScale;

                // Рисуем прямоугольник
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((-point.heading * Math.PI) / 180);
                ctx.fillStyle = `hsl(${point.speed * 10}, 70%, 50%)`;
                ctx.fillRect(-screenLength / 2, -screenWidth / 2, screenLength, screenWidth);
                ctx.restore();

                // Добавляем текст с obj_id
                ctx.fillStyle = '#fff';
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                ctx.fillText(`ID: ${point.obj_id}`, x + 8, y + 4);
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
            });

            // Восстанавливаем контекст
            ctx.restore();
        } catch (err) {
            setError('Ошибка при отрисовке точек');
            console.error('Ошибка отрисовки:', err);
        }
    };

    // Инициализация canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setError('Не удалось получить контекст canvas');
            return;
        }

        try {
            // Устанавливаем размеры canvas в зависимости от размера экрана
            const updateCanvasSize = () => {
                const containerWidth = canvas.parentElement?.clientWidth || window.innerWidth;
                const containerHeight = window.innerHeight - 150; // Учитываем высоту элементов управления

                // Устанавливаем размеры canvas
                canvas.width = containerWidth - 32; // Учитываем padding
                canvas.height = containerHeight - 32;
            };

            // Обновляем размеры при монтировании и при изменении размера окна
            updateCanvasSize();
            window.addEventListener('resize', updateCanvasSize);

            // Логируем инициализацию canvas
            console.log('Инициализация canvas:', {
                width: canvas.width,
                height: canvas.height,
                context: ctx,
            });

            // Отрисовываем начальное состояние
            drawPoints(ctx, []);

            return () => {
                window.removeEventListener('resize', updateCanvasSize);
            };
        } catch (err) {
            setError('Ошибка при инициализации canvas');
            console.error('Ошибка инициализации:', err);
        }
    }, [radarData]);

    if (error) {
        return <div className='error'>{error}</div>;
    }

    if (!radarData.objects?.length) {
        return <div className='error'>Нет данных для визуализации</div>;
    }

    return (
        <div className='radar-visualization'>
            <div className='visualization-container'>
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                />
                <div className='lane-metrics'>
                    {radarData.road_sensor_lanes?.map((lane) => {
                        const currentFrame = timeFrames[currentTimeIndex];
                        const laneBoundary = currentFrame?.boundary?.lanes.find(
                            (b) => b.laneId === lane.lane_index
                        );

                        return (
                            <div key={lane.lane_index} className='lane-metric-card'>
                                <h3>Полоса {lane.lane_index}</h3>
                                {laneBoundary && (
                                    <div className='metrics'>
                                        <div className='metric'>
                                            <span className='metric-label'>Длина очереди:</span>
                                            <span className='metric-value'>
                                                {laneBoundary.queueLength.toFixed(1)}м
                                            </span>
                                        </div>
                                        <div className='metric'>
                                            <span className='metric-label'>Время ожидания:</span>
                                            <span className='metric-value'>
                                                {laneBoundary.queueDuration.toFixed(1)}с
                                            </span>
                                        </div>
                                        <div className='metric'>
                                            <span className='metric-label'>Скорость потока:</span>
                                            <span className='metric-value'>
                                                {laneBoundary.flowSpeed.toFixed(1)}км/ч
                                            </span>
                                        </div>
                                        <div className='metric'>
                                            <span className='metric-label'>Задержка:</span>
                                            <span className='metric-value'>
                                                {laneBoundary.delay.toFixed(1)}с
                                            </span>
                                        </div>
                                        <div className='metric'>
                                            <span className='metric-label'>
                                                Начало затора (ID):
                                            </span>
                                            <span className='metric-value'>
                                                {laneBoundary.carStartId || 'Нет'}
                                            </span>
                                        </div>
                                        <div className='metric'>
                                            <span className='metric-label'>Конец затора (ID):</span>
                                            <span className='metric-value'>
                                                {laneBoundary.carEndId || 'Нет'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
            <div className='time-controls'>
                <input
                    type='range'
                    min='0'
                    max={timeFrames.length - 1}
                    value={currentTimeIndex}
                    onChange={(e) => {
                        const newIndex = parseInt(e.target.value);
                        setCurrentTimeIndex(newIndex);
                        if (isPlaying) {
                            setIsPlaying(false);
                        }
                    }}
                />
                <span className='current-time'>
                    {timeFrames[currentTimeIndex]
                        ? new Date(timeFrames[currentTimeIndex].time).toLocaleTimeString()
                        : '00:00:00'}
                </span>
            </div>
            <div className='controls'>
                <button
                    onClick={() => {
                        console.log('Нажата кнопка воспроизведения:', { isPlaying });
                        setIsPlaying(!isPlaying);
                    }}
                >
                    {isPlaying ? 'Пауза' : 'Воспроизвести'}
                </button>
                <button onClick={() => setCurrentTimeIndex(0)}>Сбросить</button>
                <div className='scale-control'>
                    <span>Масштаб:</span>
                    <input
                        type='range'
                        min='0.1'
                        max='2'
                        step='0.1'
                        value={scale}
                        onChange={(e) => setScale(parseFloat(e.target.value))}
                    />
                    <span>{scale.toFixed(1)}x</span>
                </div>
            </div>
        </div>
    );
};
