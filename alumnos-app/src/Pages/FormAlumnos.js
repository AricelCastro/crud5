import * as React from 'react';
import { View } from 'react-native';
import { Appbar, Snackbar } from 'react-native-paper';
import useAlumnoFormController from '../Hooks/useAlumnosForm';
import AlumnoForm from '../Components/AlumnosForm';
import { AuthContext } from '../Services/AuthContext';

export default function FormAlumnos() {
  const { id, form, onChange, onSave, onCancel, saving, invalid, msg, setMsg } = useAlumnoFormController();
  const auth = React.useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider no envuelve la app.');
  const { logout } = auth;

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={onCancel} />
        <Appbar.Content title={id ? 'Editar alumno' : 'Nuevo alumno'} />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

      <AlumnoForm
        form={form}
        onChange={onChange}
        onSave={onSave}
        onCancel={onCancel}
        saving={saving}
        invalid={invalid}
      />

      <Snackbar visible={!!msg} onDismiss={() => setMsg('')}>
        {msg}
      </Snackbar>
    </View>
  );
}
