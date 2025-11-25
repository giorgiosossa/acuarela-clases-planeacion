<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Grupos - {{ $month }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "Apple";
        }

        body {
            font-family: ui-rounded, 'SF Pro Rounded', 'Helvetica Rounded', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 13px;
            color: #000000;
            line-height: 1.5;
            background-color: #ffffff;
            padding: 24px 16px;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 8px;
            padding: 32px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
        }

        .header {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #000000;
        }

        .header h1 {
            color: #000000;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
        }

        .header p {
            color: #666666;
            font-size: 14px;
            font-weight: 500;
        }

        .meta {
            margin-bottom: 20px;
            padding: 8px 0;
            font-size: 12px;
            color: #666666;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .meta span {
            font-weight: 500;
            font-family: Arial;
        }

        .group-card {
            margin-bottom: 20px;
            background: #ffffff;
            border: 1px solid #000000;
            border-radius: 8px;
            overflow: hidden;
            transition: box-shadow 0.2s ease;
        }

        .group-card:hover {
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .group-header {
            padding: 16px 20px;
            background-color: #fafafa;
            border-bottom: 1px solid #000000;
        }

        .group-title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .group-title {
            font-size: 16px;
            font-weight: 700;
            color: #000000;
            letter-spacing: -0.3px;
        }

        .group-month {
            font-size: 12px;
            color: #666666;
            font-weight: 600;
        }

        .group-info {
            display: flex;
            gap: 8px;
            font-size: 12px;
            flex-wrap: wrap;
            align-items: center;
        }

        .info-badge {
            padding: 4px 10px;
            border-radius: 12px;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 11px;
        }

        .badge-neutral {
            background-color: #ffffff;
            color: #000000;
            border: 1px solid #000000;
        }

        .badge-subtle {
            color: #666666;
            font-weight: 500;
            padding: 4px 0;
        }

        .group-note {
            margin-top: 8px;
            font-size: 11px;
            color: #666666;
            line-height: 1.4;
            padding: 8px;
            background: #ffffff;
            border-left: 2px solid #000000;
        }

        .calendar-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
        }

        .calendar-table th {
            background-color: #ffffff;
            padding: 10px 6px;
            text-align: center;
            border-bottom: 2px solid #000000;
            font-weight: 700;
            color: #000000;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .calendar-table th.label-cell {
            background-color: #fafafa;
            width: 90px;
            text-align: left;
            padding-left: 20px;
            border-right: 1px solid #000000;
            font-size: 11px;
            text-transform: none;
            color: #000000;
            font-weight: 700;
        }

        .calendar-table td {
            padding: 10px 6px;
            text-align: center;
            border-bottom: 1px solid #f0f0f0;
            background-color: #ffffff;
        }

        .calendar-table tbody tr:last-child td {
            border-bottom: none;
        }

        .calendar-table tbody tr:hover {
            background-color: #fafafa;
        }

        .calendar-table td.label-cell {
            background-color: #fafafa;
            font-weight: 700;
            color: #000000;
            text-align: left;
            padding-left: 20px;
            border-right: 1px solid #000000;
        }

        .day-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }

        .day-name {
            font-weight: 600;
            color: #666666;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .day-number {
            font-size: 13px;
            color: #000000;
            font-weight: 700;
        }

        .skill-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.2px;
            background-color: #000000;
            color: #ffffff;
            transition: all 0.2s ease;
        }

        .skill-badge:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .skill-week-0 {
            background-color: #000000;
            color: #ffffff;
        }
        .skill-week-1 {
            background-color: #ffffff;
            color: #000000;
            border: 2px solid #000000;
        }
        .skill-week-2 {
            background-color: #333333;
            color: #ffffff;
        }
        .skill-week-3 {
            background-color: #f5f5f5;
            color: #000000;
            border: 2px solid #000000;
        }
        .skill-week-4 {
            background-color: #666666;
            color: #ffffff;
        }

        .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            color: #666666;
            font-size: 11px;
            font-weight: 500;
        }

        .no-data {
            text-align: center;
            padding: 60px 20px;
            color: #666666;
            font-size: 13px;
            font-weight: 500;
        }

        .divider {
            height: 1px;
            background-color: #e5e5e5;
            margin: 16px 0;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .container {
                padding: 16px;
            }

            .header h1 {
                font-size: 22px;
            }

            .meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 6px;
            }

            .calendar-table {
                font-size: 10px;
            }

            .calendar-table th,
            .calendar-table td {
                padding: 8px 4px;
            }
        }
    </style>
</head>
<body>
<div class="container">
    <!-- Header -->
    <div class="header">
        <h1>Grupos</h1>
        <p>{{ $month }}</p>
    </div>


    <div class="divider"></div>

    <!-- Groups -->
    @if(count($groups) > 0)
        @foreach($groups as $group)
            <div class="group-card">
                <!-- Group Header -->
                <div class="group-header">
                    <div class="group-title-row">
                        <div class="group-title">{{ $group['hour'] }}</div>

                    </div>
                    <div class="group-info">
                        <span class="info-badge badge-neutral">{{ $group['days'] }}</span>
                        <span class="info-badge badge-neutral">{{ $group['level']->name }}</span>
                    </div>

                </div>

                <!-- Calendar Table -->
                <table class="calendar-table">
                    <thead>
                    <tr>
                        <th class="label-cell">Fecha</th>
                        @foreach($group['dates_in_month'] as $date)
                            <th>
                                <div class="day-header">
                                    <span class="day-name">{{ $date['day'] }}</span>
                                    <span class="day-number">{{ $date['formatted'] }}</span>
                                </div>
                            </th>
                        @endforeach
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="label-cell">Objetivos</td>
                        @foreach($group['dates_in_month'] as $index => $date)
                            @php
                                // Calcular quincena (cada 2 fechas)
                                $weeksElapsed = floor($index / 4);

                                // Calcular skill indexes incrementados
                                $adjustedIndexes = array_map(function($idx) use ($weeksElapsed) {
                                    return $idx + $weeksElapsed;
                                }, $group['unique_skill_indexes']);

                                $skillText = implode('-', $adjustedIndexes);

                                // Color según quincena
                                $colorClass = 'skill-week-' . ($weeksElapsed % 5);
                            @endphp
                            <td>
                                <span class="skill-badge {{ $colorClass }}">{{ $skillText }}</span>
                            </td>
                        @endforeach
                    </tr>
                    </tbody>
                </table>
            </div>
        @endforeach
    @else
        <div class="no-data">
            No hay grupos registrados
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Generado automáticamente · {{ date('Y') }}</p>
    </div>
</div>
</body>
</html>
