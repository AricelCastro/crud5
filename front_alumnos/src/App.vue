<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'

// Firebase
import { initializeApp } from "firebase/app"
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"

// =====================
// Config Firebase
// =====================
const firebaseConfig = {
  apiKey: "AIzaSyAGoLg3EjfI6IXy7H5DRKgPzx3osmP9vr8",
  authDomain: "registro-a3b4a.firebaseapp.com",
  projectId: "registro-a3b4a",
  storageBucket: "registro-a3b4a.firebasestorage.app",
  messagingSenderId: "165715388209",
  appId: "1:165715388209:web:3765060692f9a5efcc7210",
  measurementId: "G-4XJ82F9ZE1"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// =====================
// Variables
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

// Referencia a la colección
const alumnosRef = collection(db, 'alumnos')

// =====================
// Cargar alumnos
// =====================
const cargarAlumnos = async () => {
  try {
    const snapshot = await getDocs(alumnosRef)
    alumnos.value = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'No se pudieron cargar los alumnos', 'error')
  }
}

// =====================
// Validar formulario
// =====================
const validarFormulario = () => {
  const { nombre, apellido, carrera, telefono } = nuevoAlumno.value
  if (!nombre || !apellido || !carrera || !telefono) {
    Swal.fire('Error', 'Todos los campos son obligatorios', 'error')
    return false
  }
  if (!/^\d{10}$/.test(telefono)) {
    Swal.fire('Error', 'Teléfono inválido', 'error')
    return false
  }
  if (apellido.trim().split(/\s+/).length < 2) {
    Swal.fire('Error', 'Debe ingresar dos apellidos', 'error')
    return false
  }
  return true
}

// =====================
// Guardar alumno
// =====================
const guardarAlumno = async () => {
  if (!validarFormulario()) return

  try {
    if (editado.value) {
      const docRef = doc(db, 'alumnos', nuevoAlumno.value.id)
      await updateDoc(docRef, { ...nuevoAlumno.value })
      Swal.fire('Actualizado', 'Alumno actualizado correctamente', 'success')
      editado.value = false
    } else {
      await addDoc(alumnosRef, { ...nuevoAlumno.value })
      Swal.fire('Guardado', 'Alumno agregado correctamente', 'success')
    }

    nuevoAlumno.value = { id: null, nombre:'', apellido:'', carrera:'', telefono:'', imagenURL:'' }
    cargarAlumnos()
  } catch (error) {
    console.error(error)
    Swal.fire('Error', 'Ocurrió un error al guardar', 'error')
  }
}

// =====================
// Editar alumno
// =====================
const editarAlumno = (alumno) => {
  nuevoAlumno.value = { ...alumno }
  editado.value = true
}

// =====================
// Eliminar alumno
// =====================
const eliminarAlumno = async (id) => {
  const result = await Swal.fire({
    title: '¿Eliminar alumno?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  })

  if (result.isConfirmed) {
    try {
      await deleteDoc(doc(db, 'alumnos', id))
      Swal.fire('Eliminado', 'Alumno eliminado correctamente', 'success')
      cargarAlumnos()
    } catch (error) {
      console.error(error)
      Swal.fire('Error', 'No se pudo eliminar el alumno', 'error')
    }
  }
}

// =====================
// Cargar al iniciar
// =====================
onMounted(cargarAlumnos)
</script>

<template>
<div class="container mt-4">
  <!-- FORMULARIO -->
  <div class="card shadow p-4 mb-4">
    <h2 class="text-center mb-4">Formulario de Alumnos</h2>

    <form @submit.prevent="guardarAlumno">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Nombre</label>
          <input type="text" class="form-control" v-model="nuevoAlumno.nombre" maxlength="50">
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Apellidos (paterno y materno)</label>
          <input type="text" class="form-control" v-model="nuevoAlumno.apellido" maxlength="70">
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Carrera</label>
          <select class="form-select" v-model="nuevoAlumno.carrera">
            <option value="" disabled>Seleccione una carrera</option>
            <option>Ingeniería en Sistemas Computacionales</option>
            <option>Ingeniería Industrial</option>
            <option>Licenciatura en Contaduría</option>
            <option>Licenciatura en Administración</option>
            <option>Ingeniería en Mecatrónica</option>
            <option>Ingeniería en Gestión Empresarial</option>
          </select>
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Teléfono</label>
          <div class="input-group">
            <span class="input-group-text">+52</span>
            <input type="text" class="form-control" v-model="nuevoAlumno.telefono" maxlength="10">
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">Imagen URL</label>
          <input type="text" class="form-control" v-model="nuevoAlumno.imagenURL">
        </div>
      </div>

      <button type="submit" class="btn btn-primary">
        {{ editado ? 'Actualizar Alumno' : 'Agregar Alumno' }}
      </button>
    </form>
  </div>

  <!-- TABLA -->
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
            <td>
              <img v-if="alumno.imagenURL" :src="alumno.imagenURL" width="50">
            </td>
            <td>
              <button class="btn btn-danger mx-2" @click="eliminarAlumno(alumno.id)">🗑</button>
              <button class="btn btn-warning" @click="editarAlumno(alumno)">✏</button>
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