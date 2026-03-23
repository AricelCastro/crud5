<template>
  <div class="container" style="max-width:900px">
    <!-- Formulario -->
    <div class="card shadow p-3 mt-4">
      <h2 class="text-center mb-3">Formulario de Alumnos</h2>
      <form @submit.prevent="agregarAlumno">
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
              <option value="Ingeniería en Sistemas Computacionales">Ingeniería en Sistemas Computacionales</option>
              <option value="Ingeniería Industrial">Ingeniería Industrial</option>
              <option value="Licenciatura en Contaduría">Licenciatura en Contaduría</option>
              <option value="Licenciatura en Administración">Licenciatura en Administración</option>
              <option value="Ingeniería en Mecatrónica">Ingeniería en Mecatrónica</option>
              <option value="Ingeniería en Gestión Empresarial">Ingeniería en Gestión</option>
            </select>
            <small class="text-danger" v-if="errores.carrera">{{ errores.carrera }}</small>
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
  <small class="text-danger" v-if="errores.telefono">{{ errores.telefono }}</small>
</div>

                </div>

        <button type="submit" class="btn btn-primary mt-3 w-100">
          {{ editado ? 'Actualizar Alumno' : 'Agregar Alumno' }}
        </button>
      </form>
    </div>

    <!-- Tabla de Alumnos -->
    <div class="card shadow mt-4">
      <div class="card-body">
        <h5 class="card-title mb-3">Lista de Alumnos</h5>
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Nombre</th>
              <th>Apellidos</th>
              <th>Carrera</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="alumno in alumnos" :key="alumno.id">
              
              <td>{{ alumno.nombre }}</td>
              <td>{{ alumno.apellido }}</td>
              <td>{{ alumno.carrera }}</td>
              <td>{{ formatTelefono(alumno.telefono) }}</td>
             
              <td>
                <button @click="editarAlumnos(alumno)" class="btn btn-warning mx-1">✏</button>
                <button @click="eliminarAlumno(alumno.id)" class="btn btn-danger mx-1">🗑</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const alumnos = ref([])

const nuevoAlumno = ref({
  nombre: '',
  apellido: '',
  carrera: '',
  telefono: '',
  imagenURL: ''
})

const editado = ref(false)
const errores = ref({})

const API = 'http://localhost:8080/alumnos'

// =====================
// Cargar alumnos
// =====================
const cargarAlumnos = async () => {
  try {
    const response = await axios.get(`${API}/traer-alumnos`)
    alumnos.value = response.data
  } catch (error) {
    console.error(error)
  }
}

// =====================
// Validación
// =====================
const validarFormulario = () => {
  errores.value = {}

  if (!nuevoAlumno.value.nombre.trim()) {
    errores.value.nombre = "El campo es obligatorio"
  } else if (!/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)*$/.test(nuevoAlumno.value.nombre)) {
  errores.value.nombre = "Debe iniciar con mayúscula y solo contener letras"
}
  if (!nuevoAlumno.value.apellido.trim()) {
    errores.value.apellido = "El campo es obligatorio"
  } else if (!/^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+$/.test(nuevoAlumno.value.apellido)) {
  errores.value.apellido = "Cada apellido debe iniciar con mayúscula y solo contener letras"
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
    if (editado.value) {
      await axios.put(`${API}/editar-alumnos/${nuevoAlumno.value.id}`, nuevoAlumno.value)
      editado.value = false
      Swal.fire({ icon: 'success', title: 'Alumno actualizado correctamente', showConfirmButton: false, timer: 1500 })
    } else {
      await axios.post(`${API}/insertar-alumnos`, nuevoAlumno.value)
      Swal.fire({ icon: 'success', title: 'Alumno agregado correctamente', showConfirmButton: false, timer: 1500 })
    }

    await cargarAlumnos()
    nuevoAlumno.value = { nombre:'', apellido:'', carrera:'', telefono:'', imagenURL:'' }
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
    await axios.delete(`${API}/eliminar-alumnos/${id}`)
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
</style>
