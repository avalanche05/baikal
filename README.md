# Цифровая Эра Транспорта | Решение команды БАМ МИСИС

Наша команда провела изучение различных подходов к определению метрик формирования очередей транспортных средств в 
рамках кейса ООО «СОРБ ИННОВА».

## [Ссылка на рабочий прототип](https://misis.tech)

## Наше решение
Наше решение включает в себя ipynb-ноутбук, бэкенд для обработки данных в режиме реального времени и фронтенд-приложение
для отображения ситуации на перекрестках. \
Был проведен анализ данных, собраны различные метрики и проведено их исследование, визуализация, разработаны эффективные алгоритмы по их вычислению. \
Также нами предложены алгоритмы по предсказанию потенциальных заторов и переключения светофорного регулирования.

### Ключевые метрики, которые считаем:

- Длина очереди (метры)
- Средня задержка автомобилей за последние n минут (секунды)
- Скорость потока (км/ч)
- Индекс скоростного показателя (определяем затор)
- Разъезд фронта и тыла
- Среднее количество остановок за последние n минут, количество тактов светофоров во время затора

### Метрики, которые также исследовали:

- Плотность трафика (машина/километр)
- Трафик-дата (количество транспортных средств за час (шт.))
- Индекс путешествий во времени  (Показатель, показывающий, сколько времени займет типичная поездка по перегруженным 
дорогам по сравнению с поездкой в свободных условиях. TTI = 1,0, если пробок нет.)
- Метры * секунды

### Предсказание затора

Используем CatBoost. На вход принимает набор признаков, характеризующих участок дороги (такие как регион, тип дороги, 
её длина, ограничения по скорости и прочее), а также информацию о трафике за различные временные интервалы (например, 
за последнюю минуту, предпоследнюю минуту, за отрезок времени от 2 до 5 минут и так далее). В ходе обучения, целевая 
переменная представлена следующей поездкой, прогнозируемой в момент въезда на данный участок.

### Изменение фаз светофорного регулирования

Необходимо минимизировать задержку на перекрестке, поэтому увеличиваем пропускную способность. 
Для этого разделяем машины по направлению, присваиваем каждой машине вес, и после этого оптимизируем весовую функцию. 
Для разбития машин по группам нужно учитывать их направление и смотреть на конфликтующие направления. Формируем граф, между 
однонаправленными полосами проводим ребро - так, машины проедут на одинаковый свет светофора. Задача оптимизации сводится к поиску максимального по весу полного подграфа в графе.

## Стек приложения

**Бэкенд:** фреймворк FastApi, Docker

**Фронтенд:** React, Tailwind, TypeScript, MobX

**ML:** CatBoost

## Команда
[Света, Продакт/Дизайнер](https://t.me/gleamhaze)

[Лиза, Algorithms/Backend](https://t.me/lisaanthro)

[Ваня, Algorithms/Backend](https://t.me/avalanche05) 

[Женя, Frontend](https://t.me/shmate)

[Тимур, DS/Analytics](https://t.me/goddesu)
