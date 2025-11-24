/**
 * EJEMPLOS DE USO - Chart Components
 * @description Guía práctica de implementación de los componentes de gráficas
 * @author Esteban Soto Ojeda @elsoprimeDev
 */

import React from 'react';
import {
    PieChartCard,
    BarChartCard,
    AreaChartCard,
    LineChartCard,
    type PieData,
    type BarData,
    type TrendData,
} from '@/components/UI/Charts';

/**
 * ======================
 * EJEMPLO 1: PIE CHART
 * ======================
 * Uso típico: Distribución de categorías, porcentajes
 */
export const ExamplePieChart = () => {
    const data: PieData = [
        { name: 'Ventas', value: 45000, color: '#9333ea' },
        { name: 'Marketing', value: 23000, color: '#2563eb' },
        { name: 'Operaciones', value: 18000, color: '#16a34a' },
        { name: 'TI', value: 14000, color: '#eab308' },
    ];

    return (
        <PieChartCard
            title="Distribución de Presupuesto"
            subtitle="Por departamento - 2024"
            data={data}
            height={350}
            innerRadius={60} // 0 = Pie completo, >0 = Donut
            outerRadius={100}
            showStats={true}
            showLegend={true}
            legendPosition="right"
            showRefresh={true}
            onRefresh={() => console.log('Refresh data')}
        />
    );
};

/**
 * ======================
 * EJEMPLO 2: BAR CHART (Vertical)
 * ======================
 * Uso típico: Comparación de valores, rankings
 */
export const ExampleBarChartVertical = () => {
    const data: BarData = [
        { name: 'Enero', value: 24500, fullName: 'Ventas Enero 2024' },
        { name: 'Febrero', value: 32800, fullName: 'Ventas Febrero 2024' },
        { name: 'Marzo', value: 28900, fullName: 'Ventas Marzo 2024' },
        { name: 'Abril', value: 41200, fullName: 'Ventas Abril 2024' },
        { name: 'Mayo', value: 36500, fullName: 'Ventas Mayo 2024' },
    ];

    return (
        <BarChartCard
            title="Ventas Mensuales"
            subtitle="Primer trimestre 2024"
            data={data}
            dataKey="value"
            nameKey="name"
            layout="vertical"
            barColor="blue"
            useCustomColors={false}
            height={300}
            showGrid={true}
            barRadius={8}
            yAxisConfig={{
                fontSize: 11,
                stroke: '#6b7280',
            }}
        />
    );
};

/**
 * ======================
 * EJEMPLO 3: BAR CHART (Horizontal con colores personalizados)
 * ======================
 * Uso típico: Top categorías con colores diferenciados
 */
export const ExampleBarChartHorizontal = () => {
    const data: BarData = [
        { name: 'Producto A', value: 89, color: '#9333ea' },
        { name: 'Producto B', value: 75, color: '#2563eb' },
        { name: 'Producto C', value: 63, color: '#16a34a' },
        { name: 'Producto D', value: 52, color: '#eab308' },
        { name: 'Producto E', value: 41, color: '#ea580c' },
    ];

    return (
        <BarChartCard
            title="Top 5 Productos"
            subtitle="Satisfacción del cliente (%)"
            data={data}
            dataKey="value"
            nameKey="name"
            layout="horizontal"
            useCustomColors={true} // Usar colores de cada barra
            height={250}
            showGrid={false}
            barRadius={[8, 8, 0, 0]} // Bordes redondeados arriba
        />
    );
};

/**
 * ======================
 * EJEMPLO 4: AREA CHART (Multi-serie)
 * ======================
 * Uso típico: Tendencias temporales, comparaciones multi-variable
 */
export const ExampleAreaChart = () => {
    const data: TrendData = [
        { name: 'Ene', ingresos: 4000, gastos: 2400, utilidad: 1600 },
        { name: 'Feb', ingresos: 3000, gastos: 1398, utilidad: 1602 },
        { name: 'Mar', ingresos: 2000, gastos: 9800, utilidad: -7800 },
        { name: 'Abr', ingresos: 2780, gastos: 3908, utilidad: -1128 },
        { name: 'May', ingresos: 1890, gastos: 4800, utilidad: -2910 },
        { name: 'Jun', ingresos: 2390, gastos: 3800, utilidad: -1410 },
        { name: 'Jul', ingresos: 3490, gastos: 4300, utilidad: -810 },
    ];

    return (
        <AreaChartCard
            title="Análisis Financiero"
            subtitle="Últimos 7 meses"
            data={data}
            xAxisKey="name"
            dataKeys={[
                { key: 'ingresos', name: 'Ingresos', color: 'green' },
                { key: 'gastos', name: 'Gastos', color: 'red', type: 'line' }, // Línea en lugar de área
                { key: 'utilidad', name: 'Utilidad', color: 'blue' },
            ]}
            height={350}
            gradientFill={true}
            showGrid={true}
            showLegend={true}
            yAxisConfig={{
                tickFormatter: (value) => `$${value.toLocaleString('es-CL')}`,
            }}
        />
    );
};

/**
 * ======================
 * EJEMPLO 5: LINE CHART (Multi-línea)
 * ======================
 * Uso típico: Comparación de tendencias, evolución temporal
 */
export const ExampleLineChart = () => {
    const data: TrendData = [
        { name: 'Lun', plan: 80, actual: 75 },
        { name: 'Mar', plan: 85, actual: 88 },
        { name: 'Mié', plan: 90, actual: 92 },
        { name: 'Jue', plan: 88, actual: 85 },
        { name: 'Vie', plan: 95, actual: 98 },
        { name: 'Sáb', plan: 100, actual: 96 },
        { name: 'Dom', plan: 92, actual: 90 },
    ];

    return (
        <LineChartCard
            title="Rendimiento vs Plan"
            subtitle="Semana actual"
            data={data}
            xAxisKey="name"
            dataKeys={[
                { key: 'plan', name: 'Meta', color: 'gray', strokeWidth: 2 },
                { key: 'actual', name: 'Real', color: 'purple', strokeWidth: 3 },
            ]}
            height={300}
            showDots={true}
            curveType="monotone" // 'monotone' | 'linear' | 'step' | 'basis'
            showGrid={true}
            showLegend={true}
        />
    );
};

/**
 * ======================
 * EJEMPLO 6: Con estado de carga
 * ======================
 */
export const ExampleWithLoading = () => {
    const [loading, setLoading] = React.useState(true);
    const [data, setData] = React.useState<BarData>([]);

    React.useEffect(() => {
        // Simular carga de datos
        setTimeout(() => {
            setData([
                { name: 'A', value: 100 },
                { name: 'B', value: 200 },
            ]);
            setLoading(false);
        }, 2000);
    }, []);

    return (
        <BarChartCard
            title="Datos dinámicos"
            data={data}
            dataKey="value"
            nameKey="name"
            loading={loading}
            layout="vertical"
            barColor="blue"
            height={250}
        />
    );
};

/**
 * ======================
 * EJEMPLO 7: Con manejo de errores
 * ======================
 */
export const ExampleWithError = () => {
    const [error, setError] = React.useState<string | null>(null);
    const [data, setData] = React.useState<PieData>([]);

    const fetchData = async () => {
        setError(null);
        try {
            // Simular llamada a API que falla
            throw new Error('No se pudo conectar con el servidor');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    return (
        <PieChartCard
            title="Datos con error"
            data={data}
            error={error}
            showRefresh={true}
            onRefresh={fetchData}
            height={300}
        />
    );
};

/**
 * ======================
 * EJEMPLO 8: Con estado vacío
 * ======================
 */
export const ExampleEmpty = () => {
    return (
        <LineChartCard
            title="Sin datos"
            subtitle="No hay información disponible"
            data={[]}
            xAxisKey="name"
            dataKeys={[{ key: 'value', name: 'Valor', color: 'blue' }]}
            emptyMessage="Aún no hay registros para mostrar"
            height={300}
        />
    );
};

/**
 * ======================
 * EJEMPLO 9: Integración con backend
 * ======================
 */
interface StatsResponse {
    success: boolean;
    data: {
        distribution: Array<{ category: string; amount: number }>;
        trends: Array<{ date: string; value: number }>;
    };
}

export const ExampleWithBackend = () => {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [pieData, setPieData] = React.useState<PieData>([]);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/companies/:id/stats');
            const result: StatsResponse = await response.json();

            if (!result.success) {
                throw new Error('Error al obtener estadísticas');
            }

            // Transformar datos del backend al formato de PieChart
            const transformed: PieData = result.data.distribution.map((item, idx) => ({
                name: item.category,
                value: item.amount,
                color: ['#9333ea', '#2563eb', '#16a34a', '#eab308'][idx % 4],
            }));

            setPieData(transformed);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchStats();
    }, []);

    return (
        <PieChartCard
            title="Estadísticas de Backend"
            data={pieData}
            loading={loading}
            error={error}
            showRefresh={true}
            onRefresh={fetchStats}
            height={350}
            innerRadius={70}
            showStats={true}
        />
    );
};

/**
 * ======================
 * EJEMPLO 10: Grid completo con múltiples gráficas
 * ======================
 */
export const ExampleDashboard = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Distribución */}
            <PieChartCard
                title="Distribución de Recursos"
                data={[
                    { name: 'A', value: 400, color: '#9333ea' },
                    { name: 'B', value: 300, color: '#2563eb' },
                    { name: 'C', value: 200, color: '#16a34a' },
                ]}
                height={300}
                innerRadius={60}
                showStats={true}
            />

            {/* Comparación */}
            <BarChartCard
                title="Comparación Mensual"
                data={[
                    { name: 'Ene', value: 100 },
                    { name: 'Feb', value: 150 },
                    { name: 'Mar', value: 120 },
                ]}
                dataKey="value"
                nameKey="name"
                layout="vertical"
                barColor="blue"
                height={300}
            />

            {/* Tendencia */}
            <AreaChartCard
                title="Tendencia de Crecimiento"
                data={[
                    { name: 'S1', value: 100 },
                    { name: 'S2', value: 120 },
                    { name: 'S3', value: 150 },
                    { name: 'S4', value: 180 },
                ]}
                xAxisKey="name"
                dataKeys={[{ key: 'value', name: 'Crecimiento', color: 'green' }]}
                height={300}
                gradientFill={true}
            />

            {/* Evolución */}
            <LineChartCard
                title="Evolución Semanal"
                data={[
                    { name: 'L', actual: 80, meta: 85 },
                    { name: 'M', actual: 85, meta: 85 },
                    { name: 'X', actual: 90, meta: 85 },
                    { name: 'J', actual: 88, meta: 85 },
                    { name: 'V', actual: 95, meta: 85 },
                ]}
                xAxisKey="name"
                dataKeys={[
                    { key: 'meta', name: 'Meta', color: 'gray' },
                    { key: 'actual', name: 'Real', color: 'purple' },
                ]}
                height={300}
                showDots={true}
            />
        </div>
    );
};
