import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,

} from 'react-native';
import { BASE_URL } from '../utils/config';
import * as Common from '../utils/Common';


export default function UserSearchScreen() {

  const [query, setQuery] = useState('');
  const [fullData, setFullData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Rishon code start
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      console.log("json.results is ", json.results)
      console.log("json.results length is ", json.results.length)
      setFullData(json.results);
      setFilteredData(json.results);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setQuery(text);
    if (text === '') {
      setFilteredData(fullData);
    } else {
      const formattedQuery = text.toLowerCase();
      const filtered = fullData.filter((user) => {
        const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
        return fullName.includes(formattedQuery);
      });
      setFilteredData(filtered);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>
        {item.name.first} {item.name.last}
      </Text>
    </View>
  );

  if (loading) {

    return <Common.LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={query}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.login.uuid}
        renderItem={renderItem}
      />
    </View>
  );
}
//Rishon code end

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  itemContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});