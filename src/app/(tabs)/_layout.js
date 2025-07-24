import { Tabs } from 'expo-router'
import TabBar from '../../components/tab/tabBar'

const _layout = () => {
  return (
    <Tabs
        tabBar={props=> <TabBar {...props} />}
    >
        <Tabs.Screen
            name="index"
          
            options={{
                title: "Home",
                headerShown: false,
            }}
        />
        <Tabs.Screen
            name="settings"
            
            options={{
                title: "Settings",
                headerShown: false,
            }}
        />
       
    </Tabs>
  )
}

export default _layout