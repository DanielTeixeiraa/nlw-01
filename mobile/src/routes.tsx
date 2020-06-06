import React from 'react';
import { NavigationContainer} from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

import Home from './pages/Home';
import Points from './pages/Points';
import Detail from './pages/Detail';

const  appStack = createStackNavigator();

const Routes = () =>{
  return(
    <NavigationContainer>
      <appStack.Navigator
      headerMode="none"
      screenOptions={{
        cardStyle:{
          backgroundColor: '#f0f0f5'
        }
      }}
      >
        <appStack.Screen name="Home" component={Home} />
        <appStack.Screen name="Points" component={Points} />
        <appStack.Screen name="Detail" component={Detail} />
      </appStack.Navigator>
    </NavigationContainer>
  )
}

export default Routes;