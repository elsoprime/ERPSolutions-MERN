/**
 * Typography Example Component
 * @description: Ejemplo de cómo usar las fuentes personalizadas en componentes
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

export default function TypographyExample() {
    return (
        <div className="p-6 space-y-6">
            {/* Método 1: Usando clases utilitarias personalizadas */}
            <section>
                <h1 className="font-heading text-3xl text-gray-800 mb-4">
                    Título Principal (Noto Sans Bold)
                </h1>

                <h2 className="font-noto text-xl font-semibold text-gray-700 mb-3">
                    Subtítulo (Noto Sans)
                </h2>

                <p className="font-body text-base text-gray-600 mb-4">
                    Este es un párrafo usando Roboto Regular para el contenido principal del texto.
                </p>

                <p className="font-caption text-sm text-gray-500 mb-4">
                    Texto pequeño o caption usando Roboto Light.
                </p>

                <button className="font-button bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                    Botón con Roboto Bold
                </button>
            </section>

            {/* Método 2: Usando variables CSS directamente */}
            <section className="border-t pt-6">
                <h3 className="font-[var(--font-poppins)] text-2xl font-bold text-purple-600 mb-4">
                    Título con Poppins (Variable CSS)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-[var(--font-roboto-bold)] text-lg font-semibold mb-2">
                            Card Title
                        </h4>
                        <p className="font-[var(--font-roboto-light)] text-gray-600">
                            Descripción de la tarjeta usando Roboto Light.
                        </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-[var(--font-noto-sans)] text-lg font-semibold mb-2">
                            Otro Título
                        </h4>
                        <p className="font-[var(--font-roboto-regular)] text-gray-600">
                            Contenido con Roboto Regular.
                        </p>
                    </div>
                </div>
            </section>

            {/* Método 3: Combinando con estilos en línea */}
            <section className="border-t pt-6">
                <div
                    style={{ fontFamily: 'var(--font-poppins)' }}
                    className="text-center"
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                        Título con estilo en línea
                    </h3>
                    <p className="text-gray-600">
                        Usando la variable directamente en el style
                    </p>
                </div>
            </section>
        </div>
    )
}

/* 
EJEMPLOS DE USO EN OTROS COMPONENTES:

// 1. Para títulos importantes
<h1 className="font-heading">Mi Título</h1>

// 2. Para contenido general
<p className="font-body">Contenido del párrafo</p>

// 3. Para texto secundario
<span className="font-caption">Texto pequeño</span>

// 4. Para botones
<button className="font-button">Mi Botón</button>

// 5. Usando variables directamente
<div className="font-[var(--font-poppins)]">Texto con Poppins</div>

// 6. Combinando con otros estilos
<h2 className="font-noto text-xl font-bold text-purple-600">
  Título personalizado
</h2>
*/