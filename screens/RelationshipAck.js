import { useContext, useState, useEffect } from "react";
import React from 'react';
import { View, Text, StyleSheet, FlatList, Switch, TouchableOpacity } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { UserNToken, Token } from "../utils/Token";
import { User, UserRelation } from "../utils/Users";
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { BASE_URL } from "../utils/config";
import { useNavigation } from '@react-navigation/native';


const RelationshipAck = ({ route, navigation }) => {
  const { currentUsrToken } = useContext(AuthContext);
  const { token } = useContext(AuthContext);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCancel = () => {
    navigation.navigate('HomeScreen');
  }

  const handleSave = () => {
    let finalArray = []
    userData.forEach((item) => {
      const myDict = {
        "uniqueidentifyer": item.Userrelation.uniqueidentifyer,
        "relationuserid_ack": item.Userrelation.relationuserid_ack,
      };
      finalArray.push(myDict);
    });
    //console.log("finalArray is ", finalArray);
    //const stringifiedArray = JSON.stringify(finalArray);
    try {

      const response = axios.post(`${BASE_URL}/UpdateUserRelations/`, finalArray, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      console.log("response is ", response);
      Toast.show({
        type: 'success',
        text1: 'User relations updated successfully',
      });
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error updating user relations ', error);
      Toast.show({
        type: 'error',
        text1: 'Error updating user relations',
        text2: error.message,
      });
    }
  }

  const switchDisplayFunction = (item) => {
    let returnTF = false;
    if (item.Userrelation.relationuserid_ack === null || item.Userrelation.relationuserid_ack === undefined || item.Userrelation.relationuserid_ack === '' || item.Userrelation.relationuserid_ack === -1 || item.Userrelation.relationuserid_ack === 0) {
      returnTF = false
    }
    if (item.Userrelation.relationuserid_ack === 1) {
      returnTF = true
    }
    return returnTF
  }

  const onscreenload = async () => {
    //console.log("onscreenload is okay");
    const usertoken = new UserNToken(currentUsrToken.user, currentUsrToken.token)
    //console.log("TOKEN IS is ", token);
    try {
      const dataForAPI = {
        "loggedInUserID": usertoken.user.userid,
        "loggedInUserName": usertoken.user.username,
      }
      const dictAsString = JSON.stringify(dataForAPI);
      //console.log("dictAsString is ", dictAsString);
      const response = await axios.get(`${BASE_URL}/GetRelationsofUser/`, { params: { inputData: dictAsString } }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data) {
        setUserData(response.data);
        console.log("Response data is ", response.data);
        Toast.show({
          type: 'success',
          text1: 'User found',
          text2: `Found user: ${response.data.username}`,
        });
      }

    }
    catch (error) {
      console.log("Error in onscreenload", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.nameText}>{item.name}</Text>
      <Switch style={styles.switch} value={switchDisplayFunction(item)} onValueChange={(value) => handleTaskAck(value, item)} />
    </View>
  );

  const handleTaskAck = async (value, item) => {
    const index = userData.findIndex(obj => obj.Userrelation.uniqueidentifyer === item.Userrelation.uniqueidentifyer);
    if (index === -1) {
      console.error("Item not found in userData");
      return;

    } else {
      const updatedUserData = [...userData];
      updatedUserData[index] = { ...updatedUserData[index] }; // Create a shallow copy of the object
      updatedUserData[index].Userrelation.relationuserid_ack = value ? 1 : 0; // Update the property
      setUserData(updatedUserData); // Update the state with the modified array
    }


  }

  useEffect(() => {

    onscreenload();
    //ToDO call function to load user name of added by user
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Text style={styles.text}> hello {currentUsrToken.user.username}</Text>
      </View>


      <View style={styles.middleSection}>
        <FlatList
          data={userData}
          keyExtractor={(item) => item.Userrelation.uniqueidentifyer}
          renderItem={renderItem}
        />
      </View>



      <View style={styles.bottomSection}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => handleSave()}>
            <Text style={styles.buttonText}>  update  </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handleCancel()}>
            <Text style={styles.buttonText}>  cancel  </Text>
          </TouchableOpacity>

        </View>


      </View>

    </View>
  );

}

export default RelationshipAck;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  containerWithBorder: {
    flex: 1,
    borderWidth: 2,           // Thickness of the border
    borderColor: '#333333',   // Border color
    borderRadius: 10,         // Optional: rounded corners
    margin: 10,               // Optional: spacing around container
    overflow: 'hidden',       // Ensures rounded border clips child content
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  itemContainer: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
  },
  idText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    //marginBottom: 10,
    padding: 10,
    justifyContent: 'space-between'
  },
  switch: {
    transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]
  },
  topSection: {
    flex: 1, // 10%
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleSection: {
    flex: 8, // 80%
    backgroundColor: '#d1ecf1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,          // Thickness of the border
    borderColor: 'black',    // Border color
    borderRadius: 5,         // Optional: rounded corners
    padding: 2,             // Optional: space inside the border
    margin: 2,              // Optional: space outside the border
  },
  bottomSection: {
    flex: 1, // 10%
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

