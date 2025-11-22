<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reporte de Grupos</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.6;
        }

        .container {
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
        }

        .header h1 {
            color: #1e40af;
            font-size: 24px;
            margin-bottom: 5px;
        }

        .header p {
            color: #64748b;
            font-size: 12px;
        }

        .meta {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f1f5f9;
            border-radius: 5px;
        }

        .meta-item {
            font-size: 10px;
        }

        .meta-label {
            font-weight: bold;
            color: #475569;
        }

        .meta-value {
            color: #1e293b;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        thead {
            background-color: #1e40af;
            color: white;
        }

        th {
            padding: 12px 10px;
            text-align: left;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 10px;
        }

        tbody tr:nth-child(even) {
            background-color: #f8fafc;
        }

        tbody tr:hover {
            background-color: #f1f5f9;
        }

        .id-column {
            width: 60px;
            font-weight: bold;
            color: #64748b;
        }

        .name-column {
            font-weight: 600;
            color: #1e293b;
        }

        .description-column {
            color: #64748b;
            max-width: 300px;
        }

        .date-column {
            width: 120px;
            text-align: center;
            color: #475569;
        }

        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #94a3b8;
            font-size: 9px;
        }

        .no-data {
            text-align: center;
            padding: 40px;
            color: #94a3b8;
            font-style: italic;
        }
    </style>
</head>
<body>
<div class="container">
    <!-- Header -->
    <div class="header">
        <h1>Reporte de Grupos</h1>
        <p>Listado completo de grupos registrados</p>
    </div>

    <!-- Meta Information -->
    <div class="meta">
        <div class="meta-item">
            <span class="meta-label">Fecha de generación:</span>
            <span class="meta-value">{{ $date }}</span>
        </div>
        <div class="meta-item">
            <span class="meta-label">Total de registros:</span>
            <span class="meta-value">{{ $groups->count() }}</span>
        </div>
    </div>

    <!-- Table -->
    @if($groups->count() > 0)
        <table>
            <thead>
            <tr>
                <th class="id-column">ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="date-column">Fecha Creación</th>
            </tr>
            </thead>
            <tbody>
            @foreach($groups as $group)
                <tr>
                    <td class="id-column">#{{ $group->hour }}</td>
                    <td class="name-column">{{ $group->days }}</td>
                    <td class="description-column">
                        {{ $group->level_id ?? 'Sin nivel' }}
                    </td>
                    <td class="date-column">
                       objetivo
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">
            No hay grupos registrados en el sistema
        </div>
    @endif

    <!-- Footer -->
    <div class="footer">
        <p>Documento generado automáticamente | © {{ date('Y') }}</p>
    </div>
</div>
</body>
</html>
