<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Swal from 'sweetalert2'
import { db } from './firebase'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'

// =====================
// Variables reactivas
// =====================
const alumnos = ref([])

const nuevoAlumno = ref({
  id: null,
  nombre: '',
  apellido: '',
  carrera: '',
  telefono: '',
  imagenURL: ''
})

const editado = ref(false)
const errores = ref({})
let unsubscribe = null

// =====================
// Funciones
// =====================

// Cargar alumnos desde Firebase Firestore (en tiempo real)
const cargarAlumnos = () => {
  try {
    const alumnosCollection = collection(db, 'alumnos')
    unsubscribe = onSnapshot(alumnosCollection, (snapshot) => {
      alumnos.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    })
  } catch (error) {
    console.error('Error al cargar alumnos:', error)
    Swal.fire('Error', 'No se pudieron cargar los alumnos', 'error')
  }
}

// Validación del formulario
const validarFormulario = () => {
  errores.value = {}

  if (!nuevoAlumno.value.nombre.trim()) errores.value.nombre = "El campo es obligatorio"
  
  if (!nuevoAlumno.value.apellido.trim()) {
    errores.value.apellido = "El campo es obligatorio"
  } else if (nuevoAlumno.value.apellido.trim().split(/\s+/).length < 2) {
    errores.value.apellido = "Debes ingresar dos apellidos"
  }

  if (!nuevoAlumno.value.carrera.trim()) errores.value.carrera = "Seleccione una carrera"
  
  if (!/^\d{10}$/.test(nuevoAlumno.value.telefono)) errores.value.telefono = "El teléfono debe tener 10 dígitos"

  return Object.keys(errores.value).length === 0
}

// Guardar o actualizar alumno
const guardarAlumno = async () => {
  if (!validarFormulario()) {
    Swal.fire({
      icon: 'error',
      title: 'Formulario inválido',
      text: 'Por favor corrige los errores'
    })
    return
  }

  try {
    const alumnosCollection = collection(db, 'alumnos')
    
    if (editado.value) {
      // Actualizar alumno existente
      const docRef = doc(db, 'alumnos', nuevoAlumno.value.id)
      await updateDoc(docRef, {
        nombre: nuevoAlumno.value.nombre,
        apellido: nuevoAlumno.value.apellido,
        carrera: nuevoAlumno.value.carrera,
        telefono: nuevoAlumno.value.telefono,
        imagenURL: nuevoAlumno.value.imagenURL
      })
      Swal.fire('¡Actualizado!', 'Alumno actualizado correctamente', 'success')
      editado.value = false
    } else {
      // Crear nuevo alumno
      await addDoc(alumnosCollection, {
        nombre: nuevoAlumno.value.nombre,
        apellido: nuevoAlumno.value.apellido,
        carrera: nuevoAlumno.value.carrera,
        telefono: nuevoAlumno.value.telefono,
        imagenURL: nuevoAlumno.value.imagenURL
      })
      Swal.fire('¡Guardado!', 'Alumno agregado correctamente', 'success')
    }

    // Limpiar formulario
    nuevoAlumno.value = { id: null, nombre: '', apellido: '', carrera: '', telefono: '', imagenURL: '' }

  } catch (error) {
    console.error('Error al guardar:', error)
    Swal.fire('Error', 'Ocurrió un error al guardar: ' + error.message, 'error')
  }
}

// Editar alumno
const editarAlumno = (alumno) => {
  nuevoAlumno.value = { ...alumno }
  editado.value = true
}

// Eliminar alumno
const eliminarAlumno = async (id) => {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "No podrás revertir esto",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const docRef = doc(db, 'alumnos', id)
        await deleteDoc(docRef)
        Swal.fire('¡Eliminado!', 'El alumno ha sido eliminado.', 'success')
      } catch (error) {
        console.error('Error al eliminar:', error)
        Swal.fire('Error', 'No se pudo eliminar el alumno: ' + error.message, 'error')
      }
    }
  })
}

// =====================
// Ejecutar al iniciar y limpiar
// =====================
onMounted(cargarAlumnos)
onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<template>
<div class="container mt-4">

  <!-- FORMULARIO -->
  <div class="card shadow p-4 mb-4">
    <h2 class="text-center mb-4">Formulario de Alumnos</h2>
    <form @submit.prevent="guardarAlumno">
      <div class="row">

        <!-- Nombre -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control" :class="{ 'is-invalid': errores.nombre }" v-model="nuevoAlumno.nombre" maxlength="50">
          <small class="text-danger" v-if="errores.nombre">{{ errores.nombre }}</small>
        </div>

        <!-- Apellidos -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Apellidos (paterno y materno)</label>
          <input type="text" class="form-control" :class="{ 'is-invalid': errores.apellido }" v-model="nuevoAlumno.apellido" maxlength="70">
          <small class="text-danger" v-if="errores.apellido">{{ errores.apellido }}</small>
        </div>

        <!-- Carrera -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Carrera</label>
          <select class="form-select" :class="{ 'is-invalid': errores.carrera }" v-model="nuevoAlumno.carrera">
            <option value="" disabled>Seleccione una carrera</option>
            <option>Ingeniería en Sistemas Computacionales</option>
            <option>Ingeniería Industrial</option>
            <option>Licenciatura en Contaduría</option>
            <option>Licenciatura en Administración</option>
            <option>Ingeniería en Mecatrónica</option>
            <option>Ingeniería en Gestión Empresarial</option>
          </select>
          <small class="text-danger" v-if="errores.carrera">{{ errores.carrera }}</small>
        </div>

        <!-- Teléfono -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Teléfono</label>
          <div class="input-group">
            <span class="input-group-text">+52</span>
            <input type="text" class="form-control" :class="{ 'is-invalid': errores.telefono }" v-model="nuevoAlumno.telefono" maxlength="10">
          </div>
          <small class="text-danger" v-if="errores.telefono">{{ errores.telefono }}</small>
        </div>

        <!-- Imagen URL -->
        <div class="col-md-6 mb-3">
          <label class="form-label">Imagen URL</label>
          <input type="text" class="form-control" v-model="nuevoAlumno.imagenURL">
        </div>

      </div>

      <button type="submit" class="btn btn-primary">{{ editado ? 'Actualizar Alumno' : 'Agregar Alumno' }}</button>
    </form>
  </div>

  <!-- TABLA DE ALUMNOS -->
  <div class="card shadow">
    <div class="card-body">
      <h5 class="mb-3">Lista de Alumnos</h5>
      <table class="table table-hover align-middle">
        <thead class="table-light">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Carrera</th>
            <th>Teléfono</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alumno in alumnos" :key="alumno.id">
            <td>{{ alumno.id }}</td>
            <td>{{ alumno.nombre }}</td>
            <td>{{ alumno.apellido }}</td>
            <td>{{ alumno.carrera }}</td>
            <td>{{ alumno.telefono }}</td>
            <td><img v-if="alumno.imagenURL" :src="alumno.imagenURL" width="50"></td>
            <td>
              <button class="btn btn-warning mx-2" @click="editarAlumno(alumno)">✏</button>
              <button class="btn btn-danger" @click="eliminarAlumno(alumno.id)">🗑</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

</div>
</template>

<style scoped>
img {
  border-radius: 6px;
}
</style>