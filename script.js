class ListaInteractiva {
    constructor() {
        this.elementos = [];
        this.filtroActual = 'todos';
        this.tema = 'oscuro';
        this.estadisticasEditables = {
            activo: false,
            total: 0,
            favoritos: 0,
            completados: 0,
            pendientes: 0
        };
        this.inicializar();
    }

    inicializar() {
        this.cargarElementos();
        this.configurarEventListeners();
        this.cargarTema();
        this.cargarEstadisticasEditables();
        this.actualizarEstadisticas();
        this.generarResumenDetallado();
    }

    configurarEventListeners() {
        document.getElementById('toggle-lista').addEventListener('click', () => this.toggleLista());
        document.getElementById('buscador').addEventListener('input', (e) => this.filtrarElementos(e.target.value));
        
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.cambiarFiltro(e.target.dataset.filtro));
        });
        
        document.getElementById('toggle-tema').addEventListener('click', () => this.cambiarTema());
        document.getElementById('agregar-btn').addEventListener('click', () => this.agregarElemento());
        
        // Event listeners para estadísticas editables
        document.querySelectorAll('.btn-editar-estadistica').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contador = e.target.closest('.contador');
                const tipo = contador.dataset.tipo;
                this.editarEstadistica(tipo);
            });
        });
        
        document.getElementById('reset-estadisticas').addEventListener('click', () => this.resetEstadisticas());
        document.getElementById('auto-calcular').addEventListener('click', () => this.autoCalcularEstadisticas());
        document.getElementById('exportar-datos').addEventListener('click', () => this.exportarDatos());
    }

    toggleLista() {
        const lista = document.getElementById('lista-elementos');
        const boton = document.getElementById('toggle-lista');
        const estaExpandida = lista.classList.toggle('collapsed');
        boton.textContent = estaExpandida ? 'Expandir Lista' : 'Contraer Lista';
        boton.setAttribute('aria-expanded', !estaExpandida);
    }

    filtrarElementos(termino) {
        const elementos = document.querySelectorAll('.lista ul li');
        let elementosVisibles = 0;
        
        elementos.forEach(item => {
            const texto = item.querySelector('.texto').textContent.toLowerCase();
            const coincide = texto.includes(termino.toLowerCase());
            item.style.display = coincide ? 'flex' : 'none';
            if (coincide) elementosVisibles++;
        });
        
        if (termino) {
            document.getElementById('total-items').textContent = elementosVisibles;
        } else {
            this.actualizarEstadisticas();
        }
    }

    cambiarFiltro(filtro) {
        this.filtroActual = filtro;
        
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filtro === filtro);
        });
        
        this.aplicarFiltro();
    }

    aplicarFiltro() {
        const elementos = document.querySelectorAll('.lista ul li');
        let elementosVisibles = 0;
        
        elementos.forEach(item => {
            const prioridad = item.dataset.prioridad;
            const estaCompletado = item.classList.contains('completado');
            let visible = false;
            
            switch(this.filtroActual) {
                case 'todos':
                    visible = true;
                    break;
                case 'completados':
                    visible = estaCompletado;
                    break;
                case 'pendientes':
                    visible = !estaCompletado;
                    break;
                case 'urgente':
                    visible = prioridad === 'urgente';
                    break;
                case 'importante':
                    visible = prioridad === 'importante';
                    break;
                case 'normal':
                    visible = prioridad === 'normal';
                    break;
                default:
                    visible = true;
            }
            
            item.style.display = visible ? 'flex' : 'none';
            if (visible) elementosVisibles++;
        });
        
        document.getElementById('total-items').textContent = elementosVisibles;
    }

    cargarTema() {
        const temaGuardado = localStorage.getItem('tema') || 'oscuro';
        this.tema = temaGuardado;
        document.documentElement.setAttribute('data-tema', this.tema);
        const icono = document.querySelector('.tema-icon');
        icono.textContent = this.tema === 'oscuro' ? '🌙' : '☀️';
    }

    cambiarTema() {
        this.tema = this.tema === 'oscuro' ? 'claro' : 'oscuro';
        document.documentElement.setAttribute('data-tema', this.tema);
        const icono = document.querySelector('.tema-icon');
        icono.textContent = this.tema === 'oscuro' ? '🌙' : '☀️';
        localStorage.setItem('tema', this.tema);
    }

    agregarElemento() {
        const texto = prompt('Ingresa el nuevo elemento:');
        if (texto && texto.trim() !== '') {
            const prioridad = this.solicitarPrioridad('normal');
            if (prioridad) {
                const nuevoElemento = {
                    id: Date.now(),
                    texto: texto.trim(),
                    prioridad: prioridad,
                    fecha: new Date().toLocaleDateString('es-ES'),
                    favorito: false,
                    completado: false
                };
                
                this.elementos.unshift(nuevoElemento);
                this.guardarElementos();
                this.renderizarElementos();
                this.actualizarEstadisticas();
                this.generarResumenDetallado();
                
                const nuevoLi = document.querySelector(`[data-id="${nuevoElemento.id}"]`);
                if (nuevoLi) {
                    nuevoLi.classList.add('nuevo');
                    setTimeout(() => nuevoLi.classList.remove('nuevo'), 2000);
                }
            }
        }
    }

    // MÉTODO CORREGIDO: Solicitar prioridad de forma interactiva
    solicitarPrioridad(prioridadActual = 'normal') {
        // Crear un modal simple para seleccionar prioridad
        const modal = document.createElement('div');
        modal.className = 'modal-prioridad';
        modal.innerHTML = `
            <div class="modal-contenido-prioridad">
                <h3>Seleccionar Prioridad</h3>
                <div class="opciones-prioridad">
                    <button class="opcion-prioridad" data-prioridad="normal">
                        <span class="icono-prioridad">⚪</span>
                        <span>Normal</span>
                        ${prioridadActual === 'normal' ? '✓' : ''}
                    </button>
                    <button class="opcion-prioridad" data-prioridad="importante">
                        <span class="icono-prioridad">🔴</span>
                        <span>Importante</span>
                        ${prioridadActual === 'importante' ? '✓' : ''}
                    </button>
                    <button class="opcion-prioridad" data-prioridad="urgente">
                        <span class="icono-prioridad">🔥</span>
                        <span>Urgente</span>
                        ${prioridadActual === 'urgente' ? '✓' : ''}
                    </button>
                </div>
                <div class="botones-modal-prioridad">
                    <button class="btn-cancelar-prioridad">Cancelar</button>
                </div>
            </div>
        `;

        // Añadir estilos al modal
        const estilos = document.createElement('style');
        estilos.textContent = `
            .modal-prioridad {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 3000;
                backdrop-filter: blur(5px);
            }
            .modal-contenido-prioridad {
                background: var(--color-fondo-lista);
                padding: 30px;
                border-radius: 15px;
                border: 1px solid var(--color-borde-lista);
                max-width: 400px;
                width: 90%;
                text-align: center;
            }
            .modal-contenido-prioridad h3 {
                color: var(--color-texto);
                margin-bottom: 20px;
                font-size: 1.3rem;
            }
            .opciones-prioridad {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }
            .opcion-prioridad {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 15px;
                background: rgba(255, 255, 255, 0.05);
                border: 2px solid transparent;
                border-radius: 10px;
                color: var(--color-texto);
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 1rem;
            }
            .opcion-prioridad:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-2px);
            }
            .opcion-prioridad[data-prioridad="normal"]:hover {
                border-color: #70a1ff;
            }
            .opcion-prioridad[data-prioridad="importante"]:hover {
                border-color: #ff4757;
            }
            .opcion-prioridad[data-prioridad="urgente"]:hover {
                border-color: #ffa502;
            }
            .icono-prioridad {
                font-size: 1.5rem;
            }
            .botones-modal-prioridad {
                display: flex;
                justify-content: center;
            }
            .btn-cancelar-prioridad {
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid var(--color-borde-lista);
                color: var(--color-texto);
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .btn-cancelar-prioridad:hover {
                background: var(--color-borde);
                color: #111;
            }
        `;
        document.head.appendChild(estilos);
        document.body.appendChild(modal);

        // Retornar una promesa para manejar la selección
        return new Promise((resolve) => {
            let prioridadSeleccionada = prioridadActual;

            // Event listeners para las opciones
            modal.querySelectorAll('.opcion-prioridad').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    prioridadSeleccionada = btn.dataset.prioridad;
                    
                    // Remover selección anterior
                    modal.querySelectorAll('.opcion-prioridad').forEach(opcion => {
                        opcion.innerHTML = opcion.innerHTML.replace('✓', '');
                    });
                    
                    // Añadir check a la seleccionada
                    btn.innerHTML += ' ✓';
                    
                    // Cerrar modal después de breve delay
                    setTimeout(() => {
                        document.head.removeChild(estilos);
                        document.body.removeChild(modal);
                        resolve(prioridadSeleccionada);
                    }, 300);
                });
            });

            // Event listener para cancelar
            modal.querySelector('.btn-cancelar-prioridad').addEventListener('click', () => {
                document.head.removeChild(estilos);
                document.body.removeChild(modal);
                resolve(prioridadActual); // Mantener la prioridad actual
            });

            // Cerrar modal al hacer click fuera
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.head.removeChild(estilos);
                    document.body.removeChild(modal);
                    resolve(prioridadActual);
                }
            });
        });
    }

    toggleFavorito(id) {
        const elemento = this.elementos.find(item => item.id === id);
        if (elemento) {
            elemento.favorito = !elemento.favorito;
            this.guardarElementos();
            this.renderizarElementos();
            this.actualizarEstadisticas();
            this.generarResumenDetallado();
        }
    }

    // MÉTODO CORREGIDO: Cambiar prioridad
    cambiarPrioridad(id, nuevaPrioridad) {
        const elemento = this.elementos.find(item => item.id === id);
        if (elemento) {
            elemento.prioridad = nuevaPrioridad;
            this.guardarElementos();
            this.renderizarElementos();
            this.actualizarEstadisticas();
            this.generarResumenDetallado();
            
            if (this.filtroActual !== 'todos') {
                this.aplicarFiltro();
            }
        }
    }

    toggleCompletado(id) {
        const elemento = this.elementos.find(item => item.id === id);
        if (elemento) {
            elemento.completado = !elemento.completado;
            this.guardarElementos();
            this.renderizarElementos();
            this.actualizarEstadisticas();
            this.generarResumenDetallado();
            
            if (this.filtroActual === 'completados' || this.filtroActual === 'pendientes') {
                this.aplicarFiltro();
            }
        }
    }

    eliminarElemento(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
            const elemento = document.querySelector(`[data-id="${id}"]`);
            if (elemento) {
                elemento.classList.add('eliminando');
                setTimeout(() => {
                    this.elementos = this.elementos.filter(item => item.id !== id);
                    this.guardarElementos();
                    this.renderizarElementos();
                    this.actualizarEstadisticas();
                    this.generarResumenDetallado();
                }, 500);
            }
        }
    }

    actualizarEstadisticas() {
        const total = this.elementos.length;
        const favoritos = this.elementos.filter(item => item.favorito).length;
        const completados = this.elementos.filter(item => item.completado).length;
        const pendientes = total - completados;
        
        // Usar estadísticas editables si están activas, sino calcular automáticamente
        const stats = this.estadisticasEditables.activo ? this.estadisticasEditables : {
            total: total,
            favoritos: favoritos,
            completados: completados,
            pendientes: pendientes
        };
        
        document.getElementById('total-items').textContent = stats.total;
        document.getElementById('favoritos-count').textContent = stats.favoritos;
        document.getElementById('completados-count').textContent = stats.completados;
        document.getElementById('pendientes-count').textContent = stats.pendientes;
    }

    cargarEstadisticasEditables() {
        const guardadas = localStorage.getItem('estadisticasEditables');
        if (guardadas) {
            this.estadisticasEditables = JSON.parse(guardadas);
        }
    }

    guardarEstadisticasEditables() {
        localStorage.setItem('estadisticasEditables', JSON.stringify(this.estadisticasEditables));
    }

    editarEstadistica(tipo) {
        const valorActual = document.getElementById(`${tipo}-count`).textContent;
        const nuevoValor = prompt(`Editar ${tipo.toUpperCase()}:\n\nValor actual: ${valorActual}`, valorActual);
        
        if (nuevoValor !== null && !isNaN(nuevoValor) && nuevoValor.trim() !== '') {
            const numero = parseInt(nuevoValor);
            if (numero >= 0) {
                this.estadisticasEditables.activo = true;
                this.estadisticasEditables[tipo] = numero;
                this.guardarEstadisticasEditables();
                this.actualizarEstadisticas();
                
                // Efecto visual de confirmación
                const contador = document.querySelector(`[data-tipo="${tipo}"]`);
                contador.classList.add('nuevo');
                setTimeout(() => contador.classList.remove('nuevo'), 1000);
            } else {
                alert('Por favor ingresa un número válido mayor o igual a 0.');
            }
        }
    }

    resetEstadisticas() {
        if (confirm('¿Estás seguro de que quieres reiniciar las estadísticas a los valores automáticos?')) {
            this.estadisticasEditables.activo = false;
            this.guardarEstadisticasEditables();
            this.actualizarEstadisticas();
            alert('Estadísticas reiniciadas a valores automáticos.');
        }
    }

    autoCalcularEstadisticas() {
        const total = this.elementos.length;
        const favoritos = this.elementos.filter(item => item.favorito).length;
        const completados = this.elementos.filter(item => item.completado).length;
        const pendientes = total - completados;
        
        this.estadisticasEditables = {
            activo: false,
            total: total,
            favoritos: favoritos,
            completados: completados,
            pendientes: pendientes
        };
        
        this.guardarEstadisticasEditables();
        this.actualizarEstadisticas();
        this.generarResumenDetallado();
        alert('Estadísticas actualizadas automáticamente con los datos actuales.');
    }

    exportarDatos() {
        const datos = {
            elementos: this.elementos,
            estadisticas: this.estadisticasEditables,
            fechaExportacion: new Date().toISOString(),
            totalElementos: this.elementos.length,
            resumen: {
                urgentes: this.elementos.filter(item => item.prioridad === 'urgente').length,
                importantes: this.elementos.filter(item => item.prioridad === 'importante').length,
                normales: this.elementos.filter(item => item.prioridad === 'normal').length,
                completados: this.elementos.filter(item => item.completado).length,
                pendientes: this.elementos.filter(item => !item.completado).length,
                favoritos: this.elementos.filter(item => item.favorito).length
            }
        };
        
        const datosStr = JSON.stringify(datos, null, 2);
        const blob = new Blob([datosStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lista-datos-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Datos exportados correctamente.');
    }

    generarResumenDetallado() {
        const resumen = document.getElementById('resumen-detallado');
        if (!resumen) return;
        
        const urgentes = this.elementos.filter(item => item.prioridad === 'urgente');
        const importantes = this.elementos.filter(item => item.prioridad === 'importante');
        const normales = this.elementos.filter(item => item.prioridad === 'normal');
        
        const completados = this.elementos.filter(item => item.completado);
        const pendientes = this.elementos.filter(item => !item.completado);
        
        const favoritos = this.elementos.filter(item => item.favorito);
        
        resumen.innerHTML = `
            <div class="item-resumen prioridad-urgente">
                <strong>Urgentes:</strong> ${urgentes.length} elementos
            </div>
            <div class="item-resumen prioridad-importante">
                <strong>Importantes:</strong> ${importantes.length} elementos
            </div>
            <div class="item-resumen prioridad-normal">
                <strong>Normales:</strong> ${normales.length} elementos
            </div>
            <div class="item-resumen estado-completado">
                <strong>Completados:</strong> ${completados.length} elementos
            </div>
            <div class="item-resumen estado-pendiente">
                <strong>Pendientes:</strong> ${pendientes.length} elementos
            </div>
            <div class="item-resumen" style="border-left-color: #ff4757;">
                <strong>Favoritos:</strong> ${favoritos.length} elementos
            </div>
        `;
    }

    cargarElementos() {
        const guardados = localStorage.getItem('listaElementos');
        if (guardados) {
            this.elementos = JSON.parse(guardados);
        } else {
            this.elementos = [
                {
                    id: 1,
                    texto: "Reunión importante con el equipo de desarrollo",
                    prioridad: "importante",
                    fecha: new Date().toLocaleDateString('es-ES'),
                    favorito: true,
                    completado: false
                },
                {
                    id: 2,
                    texto: "Revisar y aprobar los últimos diseños",
                    prioridad: "normal",
                    fecha: new Date().toLocaleDateString('es-ES'),
                    favorito: false,
                    completado: true
                },
                {
                    id: 3,
                    texto: "Preparar presentación para stakeholders",
                    prioridad: "importante",
                    fecha: new Date().toLocaleDateString('es-ES'),
                    favorito: true,
                    completado: false
                },
                {
                    id: 4,
                    texto: "Actualizar documentación del proyecto",
                    prioridad: "normal",
                    fecha: new Date().toLocaleDateString('es-ES'),
                    favorito: false,
                    completado: false
                },
                {
                    id: 5,
                    texto: "Resolver issue crítico en producción - URGENTE",
                    prioridad: "urgente",
                    fecha: new Date().toLocaleDateString('es-ES'),
                    favorito: false,
                    completado: true
                },
                {
                    id: 6,
                    texto: "Revisar servidores caídos",
                    prioridad: "urgente",
                    fecha: new Date().toLocaleDateString('es-ES'),
                    favorito: true,
                    completado: false
                }
            ];
        }
        this.renderizarElementos();
    }

    guardarElementos() {
        localStorage.setItem('listaElementos', JSON.stringify(this.elementos));
    }

    renderizarElementos() {
        const contenedor = document.getElementById('lista-elementos');
        contenedor.innerHTML = '';
        
        this.elementos.forEach((elemento, index) => {
            const li = this.crearElementoHTML(elemento, index);
            contenedor.appendChild(li);
        });
        
        this.aplicarFiltro();
    }

    crearElementoHTML(elemento, index) {
        const li = document.createElement('li');
        li.className = `elemento ${elemento.completado ? 'completado' : ''} ${elemento.favorito ? 'favorito' : ''}`;
        li.setAttribute('data-id', elemento.id);
        li.setAttribute('data-prioridad', elemento.prioridad);
        li.setAttribute('role', 'listitem');
        li.style.animationDelay = `${(index + 1) * 0.1}s`;
        
        const iconoPrioridad = this.obtenerIconoPrioridad(elemento.prioridad);
        const iconoFavorito = elemento.favorito ? '⭐' : '';
        const estadoTexto = elemento.completado ? 'Completado' : 'Pendiente';
        const estadoClase = elemento.completado ? 'estado-completado' : 'estado-pendiente';
        
        li.innerHTML = `
            <span class="iconos">
                <span class="icono-prioridad">${iconoPrioridad}</span>
                <span class="icono-favorito">${iconoFavorito}</span>
            </span>
            <span class="contenido">
                <span class="texto">${elemento.texto}</span>
                <span class="fecha">
                    ${elemento.fecha} • ${this.obtenerTextoPrioridad(elemento.prioridad)}
                    <span class="estado-indicador ${estadoClase}">${estadoTexto}</span>
                </span>
            </span>
            <span class="acciones">
                <button class="btn-accion favorito ${elemento.favorito ? 'activo' : ''}" 
                        title="${elemento.favorito ? 'Quitar favorito' : 'Marcar favorito'}">♥</button>
                <button class="btn-accion prioridad" title="Cambiar prioridad">📊</button>
                <button class="btn-accion completar ${elemento.completado ? 'activo' : ''}" 
                        title="${elemento.completado ? 'Marcar como pendiente' : 'Marcar como completado'}">✓</button>
                <button class="btn-accion eliminar" title="Eliminar">×</button>
            </span>
        `;
        
        // Event listeners CORREGIDOS
        li.querySelector('.favorito').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleFavorito(elemento.id);
        });
        
        // MÉTODO CORREGIDO: Cambiar prioridad interactivo
        li.querySelector('.prioridad').addEventListener('click', async (e) => {
            e.stopPropagation();
            await this.cambiarPrioridadInteractivo(elemento.id);
        });
        
        li.querySelector('.completar').addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCompletado(elemento.id);
        });
        
        li.querySelector('.eliminar').addEventListener('click', (e) => {
            e.stopPropagation();
            this.eliminarElemento(elemento.id);
        });
        
        li.addEventListener('dblclick', () => {
            this.editarElemento(elemento.id);
        });
        
        return li;
    }

    // MÉTODO CORREGIDO: Cambiar prioridad interactivo
    async cambiarPrioridadInteractivo(id) {
        const elemento = this.elementos.find(item => item.id === id);
        if (elemento) {
            const nuevaPrioridad = await this.solicitarPrioridad(elemento.prioridad);
            if (nuevaPrioridad && nuevaPrioridad !== elemento.prioridad) {
                this.cambiarPrioridad(id, nuevaPrioridad);
                
                const elementoLi = document.querySelector(`[data-id="${id}"]`);
                if (elementoLi) {
                    elementoLi.classList.add('nuevo');
                    setTimeout(() => elementoLi.classList.remove('nuevo'), 1000);
                }
            }
        }
    }

    obtenerIconoPrioridad(prioridad) {
        const iconos = {
            urgente: '🔥',
            importante: '🔴',
            normal: '⚪'
        };
        return iconos[prioridad] || '⚪';
    }

    obtenerTextoPrioridad(prioridad) {
        const textos = {
            urgente: 'Urgente',
            importante: 'Importante',
            normal: 'Normal'
        };
        return textos[prioridad] || 'Normal';
    }

    editarElemento(id) {
        const elemento = this.elementos.find(item => item.id === id);
        if (elemento) {
            const nuevoTexto = prompt('Editar elemento:', elemento.texto);
            if (nuevoTexto && nuevoTexto.trim() !== '') {
                elemento.texto = nuevoTexto.trim();
                this.guardarElementos();
                this.renderizarElementos();
                this.generarResumenDetallado();
            }
        }
    }
}

// Inicializar la lista cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.lista = new ListaInteractiva();
});