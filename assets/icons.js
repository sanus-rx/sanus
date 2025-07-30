import { AntDesign, Ionicons, MaterialIcons } from "@expo/vector-icons";

export const icons = {
    index: (props)=> <AntDesign name="scan1" size={24} {...props} />,
    profile: (props)=> <MaterialIcons name="person" size={24} {...props} />,
    history: (props)=> < MaterialIcons name="history-toggle-off" size={24} {...props} />,
    alert: (props)=> <Ionicons name="notifications" size={24} {...props} />,
}