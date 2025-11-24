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
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            font-size: 9px;
            color: #1a1a1a;
            line-height: 1.5;
            background-color: #fafafa;
        }

        .container {
            padding: 20px;
            max-width: 100%;
        }

        .header {
            margin-bottom: 24px;
        }

        .header h1 {
            color: #1a1a1a;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 4px;
            letter-spacing: -0.5px;
        }

        .header p {
            color: #6b7280;
            font-size: 11px;
            font-weight: 400;
        }

        .meta {
            margin-bottom: 24px;
            padding: 0;
            font-size: 10px;
            color: #6b7280;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .meta span {
            font-weight: 400;
        }

        .group-card {
            margin-bottom: 24px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
            page-break-inside: avoid;
        }

        .group-header {
            padding: 16px 20px;
            background-color: #fafafa;
            border-bottom: 1px solid #e5e7eb;
        }

        .group-title-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .group-title {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
            letter-spacing: -0.2px;
        }

        .group-month {
            font-size: 10px;
            color: #6b7280;
            font-weight: 500;
        }

        .group-info {
            display: flex;
            gap: 8px;
            font-size: 9px;
            flex-wrap: wrap;
            align-items: center;
        }

        .info-badge {
            padding: 4px 10px;
            border-radius: 6px;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .badge-neutral {
            background-color: #f3f4f6;
            color: #374151;
        }

        .badge-subtle {
            color: #6b7280;
            font-weight: 400;
        }

        .group-note {
            margin-top: 8px;
            font-size: 9px;
            color: #6b7280;
            line-height: 1.4;
        }

        .calendar-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 9px;
        }

        .calendar-table th {
            background-color: #fafafa;
            padding: 10px 8px;
            text-align: center;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 500;
            color: #6b7280;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }

        .calendar-table th.label-cell {
            background-color: #ffffff;
            width: 80px;
            text-align: left;
            padding-left: 20px;
            border-right: 1px solid #e5e7eb;
            font-size: 9px;
            text-transform: none;
            color: #374151;
            font-weight: 600;
        }

        .calendar-table td {
            padding: 12px 8px;
            text-align: center;
            border-bottom: 1px solid #f3f4f6;
            background-color: #ffffff;
        }

        .calendar-table tbody tr:last-child td {
            border-bottom: none;
        }

        .calendar-table td.label-cell {
            background-color: #fafafa;
            font-weight: 500;
            color: #374151;
            text-align: left;
            padding-left: 20px;
            border-right: 1px solid #e5e7eb;
        }

        .day-header {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
        }

        .day-name {
            font-weight: 500;
            color: #6b7280;
            font-size: 8px;
        }

        .day-number {
            font-size: 11px;
            color: #1a1a1a;
            font-weight: 600;
        }

        .skill-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 8px;
            font-weight: 500;
            font-size: 9px;
            letter-spacing: 0.2px;
        }

        .skill-week-0 {
            background-color: #f3f4f6;
            color: #374151;
        }
        .skill-week-1 {
            background-color: #f9fafb;
            color: #4b5563;
            border: 1px solid #e5e7eb;
        }
        .skill-week-2 {
            background-color: #f3f4f6;
            color: #374151;
        }
        .skill-week-3 {
            background-color: #f9fafb;
            color: #4b5563;
            border: 1px solid #e5e7eb;
        }
        .skill-week-4 {
            background-color: #f3f4f6;
            color: #374151;
        }

        .footer {
            margin-top: 32px;
            padding-top: 16px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 8px;
            font-weight: 400;
        }

        .no-data {
            text-align: center;
            padding: 60px 20px;
            color: #9ca3af;
            font-size: 11px;
        }

        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 16px 0;
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

    <!-- Meta Information -->
    <div class="meta">
        <span>Generado el {{ $date }}</span>
        <span>{{ count($groups) }} grupos en total</span>
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
                        <div class="group-month">{{ $group['month_name'] }}</div>
                    </div>
                    <div class="group-info">
                        <span class="info-badge badge-neutral">{{ $group['days'] }}</span>
                        <span class="info-badge badge-neutral">{{ $group['level']->name }}</span>
                        <span class="info-badge badge-neutral">{{ $group['swimmers_count'] }} nadadores</span>
                        <span class="badge-subtle">· Objetivos: {{ implode('-', $group['unique_skill_indexes']) }}</span>
                    </div>
                    @if($group['note'])
                        <div class="group-note">{{ $group['note'] }}</div>
                    @endif
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
                                $weeksElapsed = floor($index / 2);

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
