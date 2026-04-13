
import * as React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ListaScreen from './src/Pages/ListAlumnos';
import { AlumnosProvider } from './src/Services/AlumnosContext'
import FormAlumnos from './src/Pages/FormAlumnos';
import LoginScreen from './src/Pages/Login';
import { AuthContext, AuthProvider } from './src/Services/AuthContext';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <AuthProvider>
        <AlumnosProvider>
          <NavigationContainer>
            <AuthNavigation />
          </NavigationContainer>
        </AlumnosProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

function AuthNavigation() {
  const auth = React.useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider no envuelve la app.');

  const { isAuthenticated } = auth;

  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Lista" component={ListaScreen} options={{ title: 'Alumnos', headerShown: false }} />
          <Stack.Screen name="Form" component={FormAlumnos} options={{ title: 'Registro Alumnos', headerShown: false }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar sesión', headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
