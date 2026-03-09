<script setup>
import { ref, computed, onMounted } from 'vue'
import Swal from 'sweetalert2'

import { db } from './firebase'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore'

// ======================
// REACTIVOS
// ======================
const alumnos = ref([])
const nuevoAlumno = ref({
  id: null,
  numeroControl: '',
  nombre: '',
  apellido: '',
  carrera: '',
  email: '',
  telefono: ''
})
const editado = ref(false)
const errores = ref({})

// ======================
// REFERENCIA A FIRESTORE
// ======================
const alumnosRef = collection(db, 'alumnos')

// ======================
// CARGAR ALUMNOS
// ======================
const cargarAlumnos = async () => {
  try {
    const querySnapshot = await getDocs(alumnosRef)
    alumnos.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error al cargar alumnos:', error)
    Swal.fire('Error', 'No se pudieron cargar los alumnos', 'error')
  }
}

// ======================
// VALIDACION
// ======================
const validarFormulario = () => {
  errores.value = {}
  const { numeroControl, nombre, apellido, carrera, email, telefono } = nuevoAlumno.value

  if (!numeroControl) errores.value.numeroControl = 'Número de control obligatorio'
  if (!nombre.trim()) errores.value.nombre = 'Nombre obligatorio'
  if (!apellido.trim()) errores.value.apellido = 'Apellido obligatorio'
  if (!carrera.trim()) errores.value.carrera = 'Carrera obligatoria'
  if (!email.trim()) errores.value.email = 'Email obligatorio'
  if (!telefono.trim()) errores.value.telefono = 'Teléfono obligatorio'

  if (numeroControl && !/^\d{8}$/.test(numeroControl)) {
    errores.value.numeroControl = 'Número de control debe tener 8 dígitos'
  }

  if (telefono && !/^\d{10}$/.test(telefono)) {
    errores.value.telefono = 'Teléfono inválido'
  }

  const partes = apellido.trim().split(/\s+/)
  if (partes.length < 2) errores.value.apellido = 'Debe ingresar dos apellidos'

  return Object.keys(errores.value).length === 0
}

// ======================
// AGREGAR / EDITAR
// ======================
const guardarAlumno = async () => {
  if (!validarFormulario()) {
    Swal.fire('Error', 'Corrige los errores del formulario', 'error')
    return
  }

  try {
    if (editado.value) {
      // Actualizar alumno
      const alumnoDoc = doc(db, 'alumnos', nuevoAlumno.value.id)
      await updateDoc(alumnoDoc, {
        numeroControl: nuevoAlumno.value.numeroControl,
        nombre: nuevoAlumno.value.nombre,
        apellido: nuevoAlumno.value.apellido,
        carrera: nuevoAlumno.value.carrera,
        email: nuevoAlumno.value.email,
        telefono: nuevoAlumno.value.telefono
      })
      Swal.fire('Actualizado', 'Alumno actualizado correctamente', 'success')
      editado.value = false
    } else {
      // Agregar alumno
      await addDoc(alumnosRef, {
        numeroControl: nuevoAlumno.value.numeroControl,
        nombre: nuevoAlumno.value.nombre,
        apellido: nuevoAlumno.value.apellido,
        carrera: nuevoAlumno.value.carrera,
        email: nuevoAlumno.value.email,
        telefono: nuevoAlumno.value.telefono
      })
      Swal.fire('Guardado', 'Alumno agregado correctamente', 'success')
    }

    // Recargar alumnos y limpiar formulario
    await cargarAlumnos()
    cerrarModal()
  } catch (error) {
    console.error('Error al guardar alumno:', error)
    Swal.fire('Error', 'Ocurrió un error al guardar', 'error')
  }
}

// ======================
// EDITAR
// ======================
const editarAlumno = (alumno) => {
  nuevoAlumno.value = { ...alumno }
  editado.value = true
}

// ======================
// ELIMINAR
// ======================
const eliminarAlumno = async (id) => {
  Swal.fire({
    title: '¿Eliminar alumno?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, 'alumnos', id))
        await cargarAlumnos()
        Swal.fire('Eliminado', 'Alumno eliminado correctamente', 'success')
      } catch (error) {
        console.error('Error al eliminar alumno:', error)
        Swal.fire('Error', 'No se pudo eliminar el alumno', 'error')
      }
    }
  })
}

// ======================
// CERRAR FORMULARIO
// ======================
const cerrarModal = () => {
  nuevoAlumno.value = {
    id: null,
    numeroControl: '',
    nombre: '',
    apellido: '',
    carrera: '',
    email: '',
    telefono: ''
  }
  editado.value = false
  errores.value = {}
}

// ======================
// CARGAR AL INICIO
// ======================
onMounted(() => {
  cargarAlumnos()
})
</script>