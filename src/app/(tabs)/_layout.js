import { Tabs } from 'expo-router';
import TabBar from '../../components/tab/tabBar';

const _layout = () => {
  return (
    <Tabs tabBar={props => <TabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Scan",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerShown: false,
        }}
      />
    
      <Tabs.Screen
        name="profile"
        options={{
          title: "profile",
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default _layout;
