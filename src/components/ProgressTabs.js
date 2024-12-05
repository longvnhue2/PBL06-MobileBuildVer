import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

const Progresstabs = (props) => {
    const {navigation, target} = props
    const Tabstxt = ['Profile', 'History', 'Insights'];

    const handleTabPress = (tab) => {
        if (tab === 'Profile') navigation.navigate('Profile');
        else if (tab === 'History') navigation.navigate('ProgressCalendar');
        else if (tab === 'Insights') navigation.navigate('InsightsScreen');
    };

    return ( 
        <View style={styles.TabsContainer}>
            {Tabstxt.map((item, idx) => (
                <TouchableOpacity key={idx} onPress={() => handleTabPress(item)}>
                    <Text style={[styles.TabsText, item === target ? styles.activeTab : null]}>
                        {item}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    TabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 50,
        paddingHorizontal: 40,
        backgroundColor: 'rgb(24, 26, 39)',
    },
    TabsText: {
        color: '#53565f',
        fontSize: 20,
    },
    activeTab: {
        color: 'white',
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        height: '100%',
        paddingTop: 10,
    },
});

export default Progresstabs;