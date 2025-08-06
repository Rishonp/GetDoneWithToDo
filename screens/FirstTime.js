import React, { useRef, useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
import * as Common from "../utils/Common"
import { AuthContext } from '../context/AuthContext';
import Onboarding from "react-native-onboarding-swiper";
import LottieView from "lottie-react-native";
import { LinearGradient } from 'expo-linear-gradient';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const FirstTime = () => {
    const navigation = useNavigation();
    const { setIsFirstTime } = useContext(AuthContext);


    const GradientBackground = ({ children }) => (
        <LinearGradient
            colors={[
                Common.getColor("backGradientEnd"),
                Common.getColor("backGradientStart"),
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.container} // Use specific gradient style
        >
            {children}
        </LinearGradient>
    );


    const setFirstTime = async () => {
        try {
            // Store that user has seen the intro
            await Common.storeFirstTimeinMobile(false);
            setIsFirstTime(false);
            //navigation.replace('LoginScreen');
        } catch (error) {
            console.error("Error storing first time:", error);
        }
    };

    return (
        <GradientBackground>
            <Onboarding
                showNext={true}
                showSkip={false}
                containerStyles={styles.onboardingContainer}
                bottomBarStyles={styles.bottomBar}
                //skipToPage={styles.skipButton}
                nextToPage={styles.nextButton}
                doneToPage={styles.doneButton}
                //skipToPage={1} // ✅ Specify the page index to skip to (last page)
                onScrollToIndexFailed={(info) => {
                    console.log('ScrollToIndex failed:', info);
                    // Handle the error gracefully
                    setFirstTime(); // Just complete the onboarding
                }}
                pages={[
                    {
                        backgroundColor: 'transparent',
                        title: 'Congratulations!',
                        image: (

                            <LottieView
                                source={require('../assets/screen1lottie.json')}
                                autoPlay
                                loop
                                style={styles.lottieAnimation}
                            />

                        ),
                        subtitle: 'Your journey to a better organized You!',
                        titleStyles: styles.onboardingTitle,
                        subTitleStyles: styles.onboardingSubtitle,
                    },
                    {
                        backgroundColor: 'transparent',
                        title: 'Be Up to Date!',
                        image: (

                            <LottieView
                                source={require('../assets/screen2lottie.json')}
                                autoPlay
                                loop
                                style={styles.lottieAnimation}
                            />

                        ),
                        subtitle: 'Add tasks and stay on top of your game.',
                        titleStyles: styles.onboardingTitle,
                        subTitleStyles: styles.onboardingSubtitle,
                    },
                ]}
                onDone={setFirstTime}
                onSkip={setFirstTime}
            />


        </GradientBackground>



    );
};


export default FirstTime;

const styles = StyleSheet.create({
    whiteBottomBar: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        width: screenWidth,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
    },
    bottomBar: {
        backgroundColor: 'transparent', // Make bottom bar transparent
        paddingHorizontal: 10,
        //paddingVertical: 10,
    },
    skipButton: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    nextButton: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    doneButton: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
    },
    onboardingContainer: {
        flex: 1,
        justifyContent: 'flex-start', // Align to top
        alignItems: 'center',
        paddingTop: 0, // Remove any top padding
    },
    onboardingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
        marginTop: 0,
        marginBottom: 0,
        //paddingHorizontal: 20,
    },
    onboardingSubtitle: {
        fontSize: 20,
        color: 'black',
        textAlign: 'center',
        //lineHeight: 24,
        paddingHorizontal: 0,
        marginTop: 0,
        fontWeight: '400',
    },
    lottieAnimation: {
        //borderColor: 'black',
        //borderWidth: 2,
        width: screenWidth * 0.9, // 50% of screen width
        height: screenHeight * 0.5, // 50% of screen height
        //marginBottom: 10,
    },
    container: {
        flex: 1,
        //backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
        color: '#333'
    },
    centerIt: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    doneButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20
    },
    buttonTextBlack: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    // ... rest of your existing styles if needed
});