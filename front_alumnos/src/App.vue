<template>
  <div class="container" style="max-width:1000px"> <!-- MÁS ANCHO -->
    
    <!-- Formulario -->
    <div class="card shadow p-3 mt-4">
      <h2 class="text-center mb-3">Formulario de Alumnos</h2>
      <form @submit.prevent="agregarAlumno" autocomplete="off">
        <div class="row g-2">

          <!-- Nombre -->
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input type="text"
                   class="form-control"
                   :class="{ 'is-invalid': errores.nombre }"
                   v-model="nuevoAlumno.nombre">
            <small class="text-danger" v-if="errores.nombre">{{ errores.nombre }}</small>
          </div>

          <!-- Apellidos -->
          <div class="col-md-6">
            <label class="form-label">Apellidos</label>
            <input type="text"
                   class="form-control"
                   :class="{ 'is-invalid': errores.apellido }"
                   v-model="nuevoAlumno.apellido">
            <small class="text-danger" v-if="errores.apellido">{{ errores.apellido }}</small>
          </div>

          <!-- Carrera -->
          <div class="col-md-6">
            <label class="form-label">Carrera</label>
            <select class="form-select"
                    :class="{ 'is-invalid': errores.carrera }"
                    v-model="nuevoAlumno.carrera">
              <option value="" disabled>Seleccione una carrera</option>
              <option v-for="carrera in carreras" :key="carrera" :value="carrera">{{ carrera }}</option>
            </select>
          </div>

          <!-- Teléfono -->
          <div class="col-md-6">
            <label class="form-label">Teléfono</label>
            <input type="text"
                   class="form-control"
                   :class="{ 'is-invalid': errores.telefono }"
                   v-model="nuevoAlumno.telefono"
                   maxlength="12"
                   @input="nuevoAlumno.telefono = nuevoAlumno.telefono.replace(/\D/g,'').slice(0,12)">
          </div>

        </div>

        <button type="submit" class="btn btn-primary mt-3 w-100">
          {{ editado ? 'Actualizar Alumno' : 'Agregar Alumno' }}
        </button>
      </form>
    </div>

    <!-- Tabla -->
    <div class="card shadow mt-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Lista de Alumnos</h5>

        <div class="table-responsive">
        <table class="table table-hover align-middle table-bordered tabla-alumnos">
          <thead class="table-dark">
            <tr>
              <!-- ❌ ID eliminado -->
              <th style="width:28%" class="nombre-columna">
                <div class="nombre-header-control">
                  <span>Nombre</span>
                  <div class="nombre-controles">
                    <select
                      class="form-select form-select-sm nombre-select"
                      v-model="busquedaNombre"
                      @change="$event.target.blur()"
                      aria-label="Filtrar alumno por nombre"
                    >
                      <option value="">Todos los alumnos</option>
                      <option v-for="nombre in nombresDisponibles" :key="nombre" :value="nombre">{{ nombre }}</option>
                    </select>
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
              <th class="acciones-columna">Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="alumno in alumnosFiltrados" :key="alumno.id">
              <td>{{ alumno.nombre }}</td>
              <td>{{ alumno.apellido }}</td>
              <td>{{ alumno.carrera }}</td>
              <td class="telefono-columna">{{ formatTelefono(alumno.telefono) }}</td>
              <td class="acciones-columna">
                <div class="acciones-botones">
                  <button @click="editarAlumnos(alumno)" class="btn btn-warning btn-sm">✏</button>
                  <button @click="eliminarAlumno(alumno.id)" class="btn btn-danger btn-sm">🗑</button>
                </div>
              </td>
            </tr>
            <tr v-if="alumnosFiltrados.length === 0">
              <td colspan="5" class="text-muted">No hay alumnos para la carrera seleccionada.</td>
            </tr>
          </tbody>
        </table>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import Swal from 'sweetalert2'
import { db } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'

const alumnos = ref([])

const nuevoAlumno = ref({
  id: null,
  nombre: '',
  apellido: '',
  carrera: '',
  telefono: ''
})

const editado = ref(false)
const errores = ref({})
const alumnosRef = collection(db, 'alumnos')
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

const normalizeWords = (text) => (text || '').trim().replace(/\s+/g, ' ')
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

// =====================
// Cargar alumnos
// =====================
const cargarAlumnos = async () => {
  try {
    const snapshot = await getDocs(alumnosRef)
    alumnos.value = snapshot.docs.map((registro) => ({ id: registro.id, ...registro.data() }))
  } catch (error) {
    console.error(error)
  }
}

// =====================
// Validación
// =====================
const validarFormulario = () => {
  errores.value = {}
  const nombre = normalizeWords(nuevoAlumno.value.nombre)
  const apellido = normalizeWords(nuevoAlumno.value.apellido)

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
      nombre: normalizeWords(nuevoAlumno.value.nombre),
      apellido: normalizeWords(nuevoAlumno.value.apellido),
      carrera: nuevoAlumno.value.carrera,
      telefono: nuevoAlumno.value.telefono
    }

    if (editado.value) {
      if (!nuevoAlumno.value.id) {
        Swal.fire({ icon: 'error', title: 'ID inválido', text: 'No se pudo identificar el alumno a actualizar' })
        return
      }
      const refDoc = doc(db, 'alumnos', String(nuevoAlumno.value.id))
      await updateDoc(refDoc, payload)
      editado.value = false
      Swal.fire({ icon: 'success', title: 'Alumno actualizado correctamente', showConfirmButton: false, timer: 1500 })
    } else {
      await addDoc(alumnosRef, payload)
      Swal.fire({ icon: 'success', title: 'Alumno agregado correctamente', showConfirmButton: false, timer: 1500 })
    }

    await cargarAlumnos()
    nuevoAlumno.value = { id: null, nombre:'', apellido:'', carrera:'', telefono:'' }
    errores.value = {}

  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un problema al guardar' })
  }
}

// =====================
// Editar alumno
// =====================
const editarAlumnos = (alumno) => {
  Object.assign(nuevoAlumno.value, alumno)
  editado.value = true
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
    await deleteDoc(doc(db, 'alumnos', String(id)))
    await cargarAlumnos()
    Swal.fire('Eliminado!', 'El alumno ha sido eliminado.', 'success')
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el alumno.' })
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

onMounted(cargarAlumnos)
</script>

<style scoped>
.card { border-radius: 10px; }

.tabla-alumnos {
  min-width: 860px;
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
  cursor: pointer;
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
</style>