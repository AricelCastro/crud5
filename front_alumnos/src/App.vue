<template>
  <!-- LOGIN -->
  <div v-if="!isAuthenticated && vista === 'login'" class="container mt-5" style="max-width:400px">
    <div class="card shadow p-4">
      <h3 class="text-center mb-3">Iniciar Sesión</h3>

      <input type="text" class="form-control mb-2" placeholder="Usuario" maxlength="8" v-model="usuario">
      <small class="text-danger" v-if="erroresLogin.user">{{ erroresLogin.user }}</small>
      <input type="password" class="form-control mb-3" placeholder="Contraseña" maxlength="8" v-model="password">
      <small class="text-danger" v-if="erroresLogin.pass">{{ erroresLogin.pass }}</small>

      <button class="btn btn-primary w-100 mb-2" @click="login">Ingresar</button>

      <button class="btn btn-outline-secondary w-100" @click="vista = 'registro'">
        Crear cuenta
      </button>
    </div>
  </div>

  <!-- REGISTRO -->
  <div v-else-if="!isAuthenticated && vista === 'registro'" class="container mt-5" style="max-width:400px">
    <div class="card shadow p-4">
      <h3 class="text-center mb-3">Crear Usuario</h3>

      <input type="text" class="form-control mb-2" placeholder="Nuevo usuario" maxlength="8" v-model="nuevoUsuario.user">
      <div class="form-text mb-2">Usuario entre 4 y 8 caracteres.</div>
      <small class="text-danger" v-if="erroresRegistro.user">{{ erroresRegistro.user }}</small>

      <input type="password" class="form-control mb-2" placeholder="Nueva contraseña" maxlength="8" v-model="nuevoUsuario.pass">
      <div class="form-text mb-2">La contraseña debe tener entre 4 y 8 caracteres.</div>
      <small class="text-danger" v-if="erroresRegistro.pass">{{ erroresRegistro.pass }}</small>

      <button class="btn btn-success w-100 mb-2" @click="registrar">
        Registrarse
      </button>

      <button class="btn btn-outline-secondary w-100" @click="vista = 'login'">
        Volver al login
      </button>
    </div>
  </div>

  <div v-else class="container-fluid py-4 dashboard-shell">
    <div class="row g-4 align-items-start">
      <aside class="col-12 col-lg-3">
        <div class="card shadow-sm sidebar-panel p-3 sticky-lg-top">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h3 class="mb-1">Bienvenido</h3>
              <p class="mb-0 text-white-50">{{ usuarioSesion || usuario || 'usuario' }}</p>
            </div>
            <button type="button" class="btn btn-sm btn-outline-light" @click="cerrarSesion">Salir</button>
          </div>

          <div class="sidebar-menu mb-3">
            <button class="sidebar-link" :class="{ active: seccionActiva === 'resumen' }" @click="seleccionarSeccion('resumen')">Resumen</button>
            <button class="sidebar-link" :class="{ active: seccionActiva === 'alumnos' }" @click="seleccionarSeccion('alumnos')">Alumnos</button>
            <button class="sidebar-link" :class="{ active: seccionActiva === 'grupos' }" @click="seleccionarSeccion('grupos')">Grupos</button>
            <button class="sidebar-link" :class="{ active: seccionActiva === 'materias' }" @click="seleccionarSeccion('materias')">Materias</button>
            <button class="sidebar-link" :class="{ active: seccionActiva === 'horario' }" @click="seleccionarSeccion('horario')">Horario</button>
          </div>

          <div class="sidebar-summary">
            <div class="summary-pill">
              <span>Total alumnos</span>
              <strong>{{ totalAlumnos }}</strong>
            </div>
            <div class="summary-pill">
              <span>Grupos</span>
              <strong>{{ gruposResumen.length }}</strong>
            </div>
            <div class="summary-pill">
              <span>Materias</span>
              <strong>{{ materiasResumen.length }}</strong>
            </div>
          </div>
        </div>
      </aside>

      <main class="col-12 col-lg-9">
        <div class="card shadow-sm p-4 mb-4 panel-bienvenida">
          <h2 class="mb-2">Bienvenido, {{ usuarioSesion || usuario || 'usuario' }}</h2>
        </div>

        <div v-if="seccionActiva === 'resumen'" class="row g-3">
          <div class="col-md-4">
            <div class="card shadow-sm stat-card h-100">
              <div class="card-body">
                <p class="text-muted mb-1">Total de alumnos</p>
                <h3 class="mb-0">{{ totalAlumnos }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card shadow-sm stat-card h-100">
              <div class="card-body">
                <p class="text-muted mb-1">Grupos distintos</p>
                <h3 class="mb-0">{{ gruposResumen.length }}</h3>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card shadow-sm stat-card h-100">
              <div class="card-body">
                <p class="text-muted mb-1">Materias distintas</p>
                <h3 class="mb-0">{{ materiasResumen.length }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="seccionActiva === 'grupos'" class="card shadow-sm p-4">
          <h3 class="mb-3">Grupos</h3>
          <div class="row g-3">
            <div v-for="item in gruposResumen" :key="item.valor" class="col-md-3">
              <div class="card grupo-item h-100">
                <div class="card-body">
                  <h5 class="card-title mb-1">{{ item.valor }}</h5>
                  <p class="card-text text-muted mb-0">{{ item.total }} alumnos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="seccionActiva === 'materias'" class="card shadow-sm p-4">
          <h3 class="mb-3">Materias</h3>
          <div class="row g-3">
            <div v-for="item in materiasResumen" :key="item.valor" class="col-md-4">
              <div class="card grupo-item h-100 materia-clickable" :class="{ 'materia-activa': materiaSeleccionada === item.valor }" @click="seleccionarMateria(item.valor)">
                <div class="card-body">
                  <h5 class="card-title mb-1">{{ item.valor }}</h5>
                  <p class="card-text text-muted mb-0">{{ item.total }} alumnos</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4 border-top pt-3" v-if="materiaSeleccionada">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div>
                <h5 class="mb-1">Alumnos en {{ materiaSeleccionada }}</h5>
                <small class="text-muted">Horario: {{ horarioMateriaSeleccionada }}</small>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge text-bg-primary">{{ alumnosMateriaSeleccionada.length }} alumnos</span>
                <button type="button" class="btn btn-sm btn-danger" @click="imprimirListaMateriaPDF" :disabled="alumnosMateriaSeleccionada.length === 0">
                  Imprimir PDF
                </button>
              </div>
            </div>

            <div class="table-responsive" v-if="alumnosMateriaSeleccionada.length > 0">
              <table class="table table-sm table-striped table-bordered align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th>No. Control</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Grupo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="alumno in alumnosMateriaSeleccionada" :key="`materia-${alumno.id}`">
                    <td>{{ alumno.numeroControl || '-' }}</td>
                    <td>{{ alumno.nombre }}</td>
                    <td>{{ alumno.apellido }}</td>
                    <td>{{ alumno.grupo || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p v-else class="text-muted mb-0">No hay alumnos asignados a esta materia.</p>
          </div>
        </div>

        <div v-else-if="seccionActiva === 'horario'" class="card shadow-sm p-4">
          <h3 class="mb-3">Horario</h3>
          <div class="row g-3">
            <div v-for="item in horariosResumen" :key="item.valor" class="col-md-4">
              <div class="card grupo-item h-100">
                <div class="card-body">
                  <h5 class="card-title mb-1">{{ item.valor }}</h5>
                  <p class="card-text text-muted mb-0">{{ item.total }} alumnos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="card shadow-sm p-3">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              <h3 class="mb-1">Alumnos</h3>
              <p class="text-muted mb-0">Total registrados: {{ totalAlumnos }}</p>
            </div>
            <button type="button" class="btn btn-success" @click="abrirFormularioNuevo">
              {{ mostrarFormulario ? 'Ocultar formulario' : 'Agregar alumno' }}
            </button>
          </div>

          <div v-if="mostrarFormulario" class="border rounded-3 p-3 mb-4 bg-light">
            <h4 class="text-center mb-3">{{ editado ? 'Editar alumno' : 'Nuevo alumno' }}</h4>
            <form @submit.prevent="agregarAlumno" autocomplete="off">
              <div class="row g-2">
                <div class="col-md-6">
                  <label class="form-label">Numero de Control</label>
                  <input
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errores.numeroControl }"
                    v-model="nuevoAlumno.numeroControl"
                    maxlength="8"
                    placeholder="Ej. A1234567 o 12345678"
                    @input="sanitizarNumeroControl"
                  >
                  <small class="text-danger" v-if="errores.numeroControl">{{ errores.numeroControl }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Nombre</label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errores.nombre }" v-model="nuevoAlumno.nombre">
                  <small class="text-danger" v-if="errores.nombre">{{ errores.nombre }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Apellidos</label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errores.apellido }" v-model="nuevoAlumno.apellido">
                  <small class="text-danger" v-if="errores.apellido">{{ errores.apellido }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Carrera</label>
                  <select class="form-select" :class="{ 'is-invalid': errores.carrera }" v-model="nuevoAlumno.carrera">
                    <option value="" disabled>Seleccione una carrera</option>
                    <option v-for="carrera in carreras" :key="carrera" :value="carrera">{{ carrera }}</option>
                  </select>
                  <small class="text-danger" v-if="errores.carrera">{{ errores.carrera }}</small>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Teléfono</label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errores.telefono }" v-model="nuevoAlumno.telefono" maxlength="12" @input="nuevoAlumno.telefono = nuevoAlumno.telefono.replace(/\D/g,'').slice(0,12)">
                  <small class="text-danger" v-if="errores.telefono">{{ errores.telefono }}</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Materia</label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errores.materia }" v-model="nuevoAlumno.materia" placeholder="Ej. Programación Web">
                  <small class="text-danger" v-if="errores.materia">{{ errores.materia }}</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Grupo</label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errores.grupo }" v-model="nuevoAlumno.grupo" placeholder="Ej. 6A">
                  <small class="text-danger" v-if="errores.grupo">{{ errores.grupo }}</small>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Horario</label>
                  <input type="text" class="form-control" :class="{ 'is-invalid': errores.horario }" v-model="nuevoAlumno.horario" placeholder="Ej. 08:00 - 10:00" maxlength="13">
                  <div class="form-text">Formato: HH:MM - HH:MM (ej. 08:00 - 10:00)</div>
                  <small class="text-danger" v-if="errores.horario">{{ errores.horario }}</small>
                </div>
              </div>
              <button type="submit" class="btn btn-primary mt-3 w-100">{{ editado ? 'Actualizar Alumno' : 'Agregar Alumno' }}</button>
            </form>
          </div>

          <div v-if="!mostrarFormulario" class="card shadow-sm mt-2">
            <div class="card-body">
              <h5 class="card-title mb-3">Lista de Alumnos</h5>
              <div class="table-responsive">
                <table class="table table-hover align-middle table-bordered tabla-alumnos">
                  <thead class="table-dark">
                    <tr>
                      <th style="width:10%">No. Control</th>
                      <th style="width:28%" class="nombre-columna">
                        <div class="nombre-header-control">
                          <span>Nombre</span>
                          <div class="nombre-controles">
                            <input list="lista-nombres" type="search" class="form-control form-control-sm nombre-select" v-model="busquedaNombre" placeholder="Buscar o seleccionar alumno" aria-label="Buscar o seleccionar alumno por nombre">
                            <datalist id="lista-nombres">
                              <option v-for="nombre in nombresDisponibles" :key="nombre" :value="nombre">{{ nombre }}</option>
                            </datalist>
                          </div>
                        </div>
                      </th>
                      <th style="width:12%">Apellidos</th>
                      <th style="width:25%" class="carrera-columna">
                        <div class="carrera-header-control">
                          <span>Carrera</span>
                          <select class="form-select" v-model="carreraSeleccionada" aria-label="Filtrar por carrera">
                            <option value="">Todas las carreras</option>
                            <option v-for="carrera in carrerasDisponibles" :key="`filtro-${carrera}`" :value="carrera">{{ carrera }}</option>
                          </select>
                        </div>
                      </th>
                      <th style="width:10%">Teléfono</th>
                      <th style="width:15%">Materia</th>
                      <th style="width:8%">Grupo</th>
                      <th style="width:12%">Horario</th>
                      <th class="acciones-columna">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="alumno in alumnosPaginados" :key="alumno.id">
                      <td>{{ alumno.numeroControl || '-' }}</td>
                      <td>{{ alumno.nombre }}</td>
                      <td>{{ alumno.apellido }}</td>
                      <td>{{ alumno.carrera }}</td>
                      <td class="telefono-columna">{{ formatTelefono(alumno.telefono) }}</td>
                      <td>{{ alumno.materia || '-' }}</td>
                      <td>{{ alumno.grupo || '-' }}</td>
                      <td>{{ alumno.horario || '-' }}</td>
                      <td class="acciones-columna">
                        <div class="acciones-botones">
                          <button @click="editarAlumnos(alumno)" class="btn btn-warning btn-sm">✏</button>
                          <button @click="eliminarAlumno(alumno.id)" class="btn btn-danger btn-sm">🗑</button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="alumnosFiltrados.length === 0">
                      <td colspan="9" class="text-muted">No hay alumnos para la carrera seleccionada.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-if="alumnosFiltrados.length > 0" class="paginacion-contenedor mt-3">
                <small class="text-muted">Mostrando {{ inicioRegistro }}-{{ finRegistro }} de {{ alumnosFiltrados.length }} registros</small>
                <nav aria-label="Paginación de alumnos">
                  <ul class="pagination pagination-sm mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" type="button" @click="irPagina(currentPage - 1)" :disabled="currentPage === 1">Anterior</button>
                    </li>
                    <li v-for="page in paginasVisibles" :key="page" class="page-item" :class="{ active: page === currentPage }">
                      <button class="page-link" type="button" @click="irPagina(page)">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPaginas }">
                      <button class="page-link" type="button" @click="irPagina(currentPage + 1)" :disabled="currentPage === totalPaginas">Siguiente</button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Usa la IP/hostname desde donde se abre la app para que funcione en red local
const API_BASE = `http://${window.location.hostname}:8081/alumnos`

const alumnos = ref([])
const isAuthenticated = ref(false)
const vista = ref('login')
const usuarioSesion = ref('')
const usuario = ref('')
const password = ref('')
const nuevoUsuario = ref({ user: '', pass: '' })
const erroresLogin = ref({ user: '', pass: '' })
const erroresRegistro = ref({ user: '', pass: '' })
const usuariosRegistrados = ref([])
const STORAGE_USERS_KEY = 'crud4_users'
const seccionActiva = ref('resumen')
const menuAbierto = ref(false)
const mostrarFormulario = ref(false)
const materiaSeleccionada = ref('')

const nuevoAlumno = ref({
  id: null,
  numeroControl: '',
  nombre: '',
  apellido: '',
  carrera: '',
  telefono: '',
  materia: '',
  grupo: '',
  horario: ''
})

const editado = ref(false)
const errores = ref({})
const PROPER_CASE_WORDS_RX = /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/
const carreras = [
  'Ingeniería en Sistemas Computacionales',
  'Ingeniería Industrial',
  'Licenciatura en Contaduría',
  'Licenciatura en Administración',
  'Ingeniería en Mecatrónica',
  'Ingeniería en Gestión Empresarial'
]
const carreraSeleccionada = ref('')
const busquedaNombre = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 10

const normalizeWords = (text) => (text || '').trim().replace(/\s+/g, ' ')

// Sanitiza el número de control: letra mayúscula solo al inicio, luego solo dígitos
const sanitizarNumeroControl = () => {
  let val = nuevoAlumno.value.numeroControl || ''
  // Separar el primer char del resto
  const primero = val.charAt(0)
  const resto = val.slice(1)

  let resultado = ''
  if (/[A-Z]/.test(primero)) {
    // Primer carácter es letra mayúscula: conservar + solo dígitos del resto (máx 7)
    resultado = primero + resto.replace(/\D/g, '').slice(0, 7)
  } else if (/[a-z]/.test(primero)) {
    // Letra minúscula al inicio: convertir a mayúscula
    resultado = primero.toUpperCase() + resto.replace(/\D/g, '').slice(0, 7)
  } else {
    // Inicia con dígito u otro: solo dígitos, máx 8
    resultado = val.replace(/\D/g, '').slice(0, 8)
  }
  nuevoAlumno.value.numeroControl = resultado
}
const normalizeHorario = (text) => {
  const value = normalizeWords(text)
  const match = value.match(/^(\d{1,2}):0+(\d{1,2})\s*-\s*(\d{1,2}):0+(\d{1,2})$/)
  if (match) {
    return `${match[1]}:${match[2].padStart(2, '0')}-${match[3]}:${match[4].padStart(2, '0')}`
  }
  return value
}
const normalizeSearch = (text) =>
  (text || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')

const carrerasDisponibles = computed(() => {
  const carrerasUnicas = new Set(
    alumnos.value
      .map((alumno) => (alumno.carrera || '').trim())
      .filter(Boolean)
  )
  return [...carrerasUnicas].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
})

const nombresDisponibles = computed(() => {
  const nombresUnicos = new Set(
    alumnos.value
      .map((alumno) => normalizeWords(`${alumno.nombre || ''} ${alumno.apellido || ''}`))
      .filter(Boolean)
  )
  return [...nombresUnicos].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
})

const alumnosFiltrados = computed(() => {
  let resultado = alumnos.value

  if (carreraSeleccionada.value) {
    resultado = resultado.filter((alumno) => alumno.carrera === carreraSeleccionada.value)
  }

  const termino = normalizeSearch(busquedaNombre.value)
  if (termino) {
    resultado = resultado.filter((alumno) => {
      const nombreCompleto = normalizeSearch(`${alumno.nombre || ''} ${alumno.apellido || ''}`)
      return nombreCompleto.includes(termino)
    })
  }

  return resultado
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(alumnosFiltrados.value.length / PAGE_SIZE)))
const totalAlumnos = computed(() => alumnos.value.length)

const agruparValores = (campo) => {
  const mapa = new Map()
  alumnos.value.forEach((alumno) => {
    const valor = normalizeWords(alumno?.[campo] || '') || 'Sin dato'
    mapa.set(valor, (mapa.get(valor) || 0) + 1)
  })

  return [...mapa.entries()]
    .map(([valor, total]) => ({ valor, total }))
    .sort((a, b) => a.valor.localeCompare(b.valor, 'es', { sensitivity: 'base' }))
}

const gruposResumen = computed(() => agruparValores('grupo'))
const materiasResumen = computed(() => agruparValores('materia'))
const horariosResumen = computed(() => agruparValores('horario'))
const alumnosMateriaSeleccionada = computed(() => {
  if (!materiaSeleccionada.value) return []
  const target = normalizeSearch(materiaSeleccionada.value)
  return alumnos.value.filter((alumno) => normalizeSearch(alumno?.materia || '') === target)
})
const alumnosMateriaOrdenados = computed(() => {
  return [...alumnosMateriaSeleccionada.value].sort((a, b) => {
    const aAp = normalizeWords(a.apellido || '')
    const bAp = normalizeWords(b.apellido || '')
    if (aAp !== bAp) return aAp.localeCompare(bAp, 'es', { sensitivity: 'base' })
    return normalizeWords(a.nombre || '').localeCompare(normalizeWords(b.nombre || ''), 'es', { sensitivity: 'base' })
  })
})
const gruposMateriaSeleccionada = computed(() => {
  const set = new Set(
    alumnosMateriaSeleccionada.value
      .map((a) => normalizeWords(a.grupo || ''))
      .filter(Boolean)
  )
  return [...set].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
})

const horarioMateriaSeleccionada = computed(() => {
  const set = new Set(
    alumnosMateriaSeleccionada.value
      .map((a) => normalizeHorario(a.horario || ''))
      .filter(Boolean)
  )
  const horarios = [...set].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
  if (horarios.length === 0) return 'Sin horario'
  return horarios.length === 1 ? horarios[0] : horarios.join(', ')
})

const alumnosPaginados = computed(() => {
  const inicio = (currentPage.value - 1) * PAGE_SIZE
  return alumnosFiltrados.value.slice(inicio, inicio + PAGE_SIZE)
})

const paginasVisibles = computed(() => {
  const pages = []
  for (let i = 1; i <= totalPaginas.value; i += 1) {
    pages.push(i)
  }
  return pages
})

const inicioRegistro = computed(() => {
  if (alumnosFiltrados.value.length === 0) return 0
  return (currentPage.value - 1) * PAGE_SIZE + 1
})

const finRegistro = computed(() => {
  if (alumnosFiltrados.value.length === 0) return 0
  return Math.min(currentPage.value * PAGE_SIZE, alumnosFiltrados.value.length)
})

const irPagina = (page) => {
  if (page < 1) {
    currentPage.value = 1
    return
  }
  if (page > totalPaginas.value) {
    currentPage.value = totalPaginas.value
    return
  }
  currentPage.value = page
}

const cargarUsuarios = () => {
  const base = [{ user: 'admin', pass: '123456' }]
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY)
    if (!raw) {
      usuariosRegistrados.value = base
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(base))
      return
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) {
      usuariosRegistrados.value = base
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(base))
      return
    }

    usuariosRegistrados.value = parsed
  } catch {
    usuariosRegistrados.value = base
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(base))
  }
}

const login = async () => {
  erroresLogin.value = { user: '', pass: '' }
  const user = (usuario.value || '').trim()
  const pass = (password.value || '').trim()

  if (!user) erroresLogin.value.user = 'El usuario es obligatorio.'
  else if (user.length < 4 || user.length > 8) erroresLogin.value.user = 'Debe tener entre 4 y 8 caracteres.'

  if (!pass) erroresLogin.value.pass = 'La contraseña es obligatoria.'
  else if (pass.length < 4 || pass.length > 8) erroresLogin.value.pass = 'Debe tener entre 4 y 8 caracteres.'

  if (erroresLogin.value.user || erroresLogin.value.pass) return

  const existe = usuariosRegistrados.value.some((u) => u.user === user && u.pass === pass)
  if (!existe) {
    erroresLogin.value.pass = 'Usuario o contraseña incorrectos.'
    return
  }

  isAuthenticated.value = true
  usuarioSesion.value = user
  seccionActiva.value = 'resumen'
  menuAbierto.value = false
  mostrarFormulario.value = false
  await cargarAlumnos()
}

const registrar = () => {
  erroresRegistro.value = { user: '', pass: '' }
  const user = (nuevoUsuario.value.user || '').trim()
  const pass = (nuevoUsuario.value.pass || '').trim()

  if (!user) erroresRegistro.value.user = 'El usuario es obligatorio.'
  else if (user.length < 4 || user.length > 8) erroresRegistro.value.user = 'Debe tener entre 4 y 8 caracteres.'

  if (!pass) erroresRegistro.value.pass = 'La contraseña es obligatoria.'
  else if (pass.length < 4 || pass.length > 8) erroresRegistro.value.pass = 'Debe tener entre 4 y 8 caracteres.'

  if (erroresRegistro.value.user || erroresRegistro.value.pass) return

  const yaExiste = usuariosRegistrados.value.some((u) => u.user === user)
  if (yaExiste) {
    erroresRegistro.value.user = 'Ese usuario ya existe.'
    return
  }

  usuariosRegistrados.value.push({ user, pass })
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(usuariosRegistrados.value))
  nuevoUsuario.value = { user: '', pass: '' }
  vista.value = 'login'
  Swal.fire({ icon: 'success', title: 'Usuario creado', timer: 1400, showConfirmButton: false })
}

const cerrarSesion = () => {
  isAuthenticated.value = false
  usuarioSesion.value = ''
  usuario.value = ''
  password.value = ''
  erroresLogin.value = { user: '', pass: '' }
  vista.value = 'login'
  seccionActiva.value = 'resumen'
  menuAbierto.value = false
  mostrarFormulario.value = false
}

const seleccionarSeccion = (seccion) => {
  seccionActiva.value = seccion
  menuAbierto.value = false
  if (seccion !== 'materias') {
    materiaSeleccionada.value = ''
  }
  if (seccion !== 'alumnos') {
    mostrarFormulario.value = false
  }
}

const seleccionarMateria = (materia) => {
  materiaSeleccionada.value = materia
}

const imprimirListaMateriaPDF = () => {
  if (!materiaSeleccionada.value || alumnosMateriaOrdenados.value.length === 0) {
    Swal.fire({ icon: 'info', title: 'Sin datos', text: 'No hay alumnos para imprimir en esta materia.' })
    return
  }

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const docente = usuarioSesion.value || usuario.value || 'No definido'
  const departamento = 'Departamento de Sistemas y Computacion'
  const periodo = 'Enero-Junio 2026'
  const materia = materiaSeleccionada.value
  const grupo = gruposMateriaSeleccionada.value.length > 0 ? gruposMateriaSeleccionada.value.join(', ') : 'Sin grupo'
  const horario = horarioMateriaSeleccionada.value

  doc.setFontSize(14)
  doc.text('Lista de Alumnos por Materia', 14, 15)
  doc.setFontSize(10)
  doc.text(`Docente: ${docente}`, 14, 24)
  doc.text(`Departamento: ${departamento}`, 14, 30)
  doc.text(`Periodo: ${periodo}`, 14, 36)
  doc.text(`Materia: ${materia}`, 14, 42)
  doc.text(`Grupo: ${grupo}`, 14, 48)
  doc.text(`Horario: ${horario}`, 14, 54)

  const body = alumnosMateriaOrdenados.value.map((alumno, index) => [
    String(index + 1),
    normalizeWords(alumno.numeroControl || '-'),
    normalizeWords(alumno.nombre || '-'),
    normalizeWords(alumno.apellido || '-'),
    normalizeWords(alumno.grupo || '-'),
  ])

  autoTable(doc, {
    startY: 61,
    head: [['No.', 'No. Control', 'Nombre', 'Apellidos', 'Grupo']],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [22, 50, 79] },
  })

  const safeMateria = materia
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_\-]/g, '')

  doc.save(`Lista_${safeMateria || 'materia'}.pdf`)
}

const abrirFormularioNuevo = () => {
  if (mostrarFormulario.value) {
    mostrarFormulario.value = false
    return
  }

  if (editado.value) editado.value = false
  nuevoAlumno.value = {
    id: null,
    numeroControl: '',
    nombre: '',
    apellido: '',
    carrera: '',
    telefono: '',
    materia: '',
    grupo: '',
    horario: ''
  }
  errores.value = {}
  mostrarFormulario.value = true
  seccionActiva.value = 'alumnos'
}

// =====================
// Cargar alumnos
// =====================
const cargarAlumnos = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/traer-alumnos`)
    alumnos.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error(error)
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar alumnos desde localhost:8081' })
  }
}

// =====================
// Validación
// =====================
const validarFormulario = () => {
  errores.value = {}
  const numeroControl = (nuevoAlumno.value.numeroControl || '').trim()
  const nombre = normalizeWords(nuevoAlumno.value.nombre)
  const apellido = normalizeWords(nuevoAlumno.value.apellido)

  // Acepta: 1 letra mayúscula al inicio + 7 dígitos, O bien 8 dígitos puros
  if (!/^([A-Z]\d{7}|\d{8})$/.test(numeroControl)) {
    errores.value.numeroControl = "Debe ser 8 dígitos (12345678) o letra mayúscula + 7 dígitos (A1234567)"
  }

  if (!nombre) {
    errores.value.nombre = "El campo es obligatorio"
  } else if (!PROPER_CASE_WORDS_RX.test(nombre)) {
    errores.value.nombre = "Cada palabra debe iniciar con mayúscula y continuar con minúsculas"
  }

  if (!apellido) {
    errores.value.apellido = "El campo es obligatorio"
  } else if (!PROPER_CASE_WORDS_RX.test(apellido)) {
    errores.value.apellido = "Cada palabra debe iniciar con mayúscula y continuar con minúsculas"
  }

  if (!nuevoAlumno.value.carrera.trim()) {
    errores.value.carrera = "El campo es obligatorio"
  }

  if (!normalizeWords(nuevoAlumno.value.materia)) {
    errores.value.materia = "El campo es obligatorio"
  }

  if (!normalizeWords(nuevoAlumno.value.grupo)) {
    errores.value.grupo = "El campo es obligatorio"
  }

  // Formato estricto: HH:MM - HH:MM  (ej. 08:00 - 10:00)
  const horarioVal = (nuevoAlumno.value.horario || '').trim()
  if (!horarioVal) {
    errores.value.horario = "El campo es obligatorio"
  } else if (!/^([01]\d|2[0-3]):[0-5]\d - ([01]\d|2[0-3]):[0-5]\d$/.test(horarioVal)) {
    errores.value.horario = "Formato inválido. Use HH:MM - HH:MM (ej. 08:00 - 10:00)"
  }

  if (!/^(?:\+52|52)?\d{10}$/.test(nuevoAlumno.value.telefono)) {
    errores.value.telefono = "El teléfono debe incluir lada de México y 10 dígitos"
  }

 
  return Object.keys(errores.value).length === 0
}

// =====================
// Formatear teléfono automático
// =====================
watch(() => nuevoAlumno.value.telefono, (val) => {
  let soloNumeros = val.replace(/\D/g, '')
  if (!soloNumeros.startsWith('52')) soloNumeros = '+52' + soloNumeros
  nuevoAlumno.value.telefono = soloNumeros
})

watch([carreraSeleccionada, busquedaNombre], () => {
  currentPage.value = 1
})

watch(alumnosFiltrados, () => {
  if (currentPage.value > totalPaginas.value) {
    currentPage.value = totalPaginas.value
  }
})

// =====================
// Agregar o actualizar
// =====================
const agregarAlumno = async () => {
  if (!validarFormulario()) {
    Swal.fire({ icon: 'error', title: 'Formulario inválido', text: 'Por favor corrige los errores' })
    return
  }

  try {
    const payload = {
      numeroControl: (nuevoAlumno.value.numeroControl || '').trim(),
      nombre: normalizeWords(nuevoAlumno.value.nombre),
      apellido: normalizeWords(nuevoAlumno.value.apellido),
      email: (nuevoAlumno.value.email || '').trim(),
      carrera: nuevoAlumno.value.carrera,
      materia: normalizeWords(nuevoAlumno.value.materia),
      grupo: normalizeWords(nuevoAlumno.value.grupo),
      horario: normalizeWords(nuevoAlumno.value.horario),
      telefono: nuevoAlumno.value.telefono,
      imagenURL: nuevoAlumno.value.imagenURL || ''
    }

    if (editado.value) {
      if (!nuevoAlumno.value.id) {
        Swal.fire({ icon: 'error', title: 'ID inválido', text: 'No se pudo identificar el alumno a actualizar' })
        return
      }
      await axios.put(`${API_BASE}/editar-alumnos/${nuevoAlumno.value.id}`, payload)
      editado.value = false
      Swal.fire({ icon: 'success', title: 'Alumno actualizado correctamente', showConfirmButton: false, timer: 1500 })
    } else {
      await axios.post(`${API_BASE}/insertar-alumnos`, payload)
      Swal.fire({ icon: 'success', title: 'Alumno agregado correctamente', showConfirmButton: false, timer: 1500 })
    }

    await cargarAlumnos()
    nuevoAlumno.value = { id: null, numeroControl:'', nombre:'', apellido:'', carrera:'', telefono:'', materia:'', grupo:'', horario:'' }
    errores.value = {}
    mostrarFormulario.value = false

  } catch (error) {
    const detail = error?.response?.data?.message || error?.message || 'Ocurrió un problema al guardar'
    Swal.fire({ icon: 'error', title: 'Error', text: detail })
  }
}

// =====================
// Editar alumno
// =====================
const editarAlumnos = (alumno) => {
  Object.assign(nuevoAlumno.value, alumno)
  editado.value = true
  mostrarFormulario.value = true
  seccionActiva.value = 'alumnos'
}

// =====================
// Eliminar alumno
// =====================
const eliminarAlumno = async (id) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esto",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  }).then(async (result) => {
    if (result.isConfirmed) await eliminarAlumnoPorId(id)
  })
}

const eliminarAlumnoPorId = async (id) => {
  try {
    if (!id) {
      Swal.fire({ icon: 'error', title: 'ID inválido', text: 'No se pudo identificar el alumno a eliminar' })
      return
    }
    await axios.delete(`${API_BASE}/eliminar-alumnos/${id}`)
    await cargarAlumnos()
    Swal.fire('Eliminado!', 'El alumno ha sido eliminado.', 'success')
  } catch (error) {
    const detail = error?.response?.data?.message || error?.message || 'No se pudo eliminar el alumno.'
    Swal.fire({ icon: 'error', title: 'Error', text: detail })
  }
}

// =====================
// Formatear teléfono para mostrar
// =====================
const formatTelefono = (num) => {
  if (!num) return ''
  let n = num.replace(/\D/g, '')
  if (n.startsWith('52')) n = n.slice(2)
  return '+52 ' + n.slice(0,3) + ' ' + n.slice(3,6) + ' ' + n.slice(6,10)
}

onMounted(() => {
  cargarUsuarios()
  if (isAuthenticated.value) cargarAlumnos()
})
</script>

<style scoped>
.card { border-radius: 10px; }

.dashboard-shell {
  max-width: 1440px;
}

.panel-bienvenida {
  color: #fff;
  background: linear-gradient(135deg, #16324f 0%, #224c74 55%, #2d7a8c 100%);
}

.sidebar-panel {
  border: 0;
  border-radius: 22px;
  color: #fff;
  background: linear-gradient(180deg, #11263d 0%, #173554 45%, #1f4b6f 100%);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.18);
}

.sidebar-kicker {
  letter-spacing: 0.12em;
  font-size: 0.72rem;
}

.sidebar-menu {
  display: grid;
  gap: 10px;
}

.sidebar-link {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.07);
  color: #f8fafc;
  border-radius: 14px;
  padding: 12px 14px;
  text-align: left;
  font-weight: 600;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.sidebar-link:hover {
  transform: translateX(2px);
  background: rgba(255, 255, 255, 0.14);
}

.sidebar-link.active {
  background: #ffffff;
  color: #0f172a;
  border-color: #ffffff;
}

.sidebar-summary {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.summary-pill {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.summary-pill span {
  color: rgba(255, 255, 255, 0.72);
}

.summary-pill strong {
  color: #fff;
}

.menu-desplegable-panel {
  min-width: 240px;
  border: 0;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
}

.menu-desplegable-panel .dropdown-item.active {
  background: #0d6efd;
  color: #fff;
}

.stat-card,
.grupo-item {
  border: 0;
  border-radius: 16px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.materia-clickable {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.materia-clickable:hover {
  transform: translateY(-2px);
}

.materia-activa {
  box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.35), 0 12px 24px rgba(15, 23, 42, 0.12);
}

.tabla-alumnos {
  min-width: 1250px;
}

.tabla-alumnos tbody {
  text-align: center;
}

.tabla-alumnos tbody td {
  text-align: center;
}

.acciones-columna {
  width: 140px;
  min-width: 140px;
  white-space: nowrap;
}

.telefono-columna {
  white-space: nowrap;
}

.acciones-botones {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.nombre-columna {
  min-width: 280px !important;
  padding: 0 !important;
  overflow: visible !important;
}

.nombre-header-control {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 4px;
  padding: 6px 4px;
  width: 100%;
  overflow: visible;
}

.nombre-header-control span {
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.85rem;
  flex-shrink: 0;
  width: 100%;
  text-align: left;
}

.nombre-controles {
  display: flex;
  gap: 4px;
  width: 100%;
  align-items: center;
}

.nombre-select {
  flex: 1;
  min-width: 80px;
  padding: 4px 6px;
  font-size: 0.75rem;
  border: 1px solid #999;
  border-radius: 3px;
  background-color: white;
  cursor: text;
  display: block;
  visibility: visible;
  height: 28px;
}

.carrera-columna {
  min-width: 275px !important;
  padding: 0 !important;
  overflow: visible !important;
}

.carrera-header-control {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 4px;
  width: 100%;
  overflow: visible;
}

.carrera-header-control span {
  font-weight: 600;
  white-space: nowrap;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.carrera-header-control select {
  min-width: 110px;
  max-width: 150px;
  padding: 3px 6px;
  font-size: 0.75rem;
  border: 1px solid #999;
  border-radius: 3px;
  background-color: white;
  cursor: pointer;
  display: inline-block;
  visibility: visible;
  overflow: visible;
}

.paginacion-contenedor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
</style>