import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import RNHTTPServer from 'react-native-http-server';
import RNFS from 'react-native-fs';

const tilesDirectory = `${RNFS.DocumentDirectoryPath}/osm_tiles`;

async function downloadAndSaveTiles() {
  // Create the directory structure for the tiles
  await RNFS.mkdir(`${tilesDirectory}/z`);

  // Download the tiles and save them to the local storage
  // Replace the URL with the actual URL of the OpenStreetMap tile you want to download
  const tileUrl = 'https://tile.openstreetmap.org/z/x/y.png';

  const localTilePath = `${tilesDirectory}/z/x/y.png`;

  // Download and save the tile
  await RNFS.downloadFile({
    fromUrl: tileUrl,
    toFile: localTilePath,
  }).promise;
}

const App = () => {
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [tileServerUrl, setTileServerUrl] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  useEffect(() => {
    const server = new RNHTTPServer({
      documentRoot: 'www/tiles', // Change this to the path of your downloaded OSM tiles
      port: 8080,
    });

    server.start(() => {
      setTileServerUrl('http://localhost:8080/{z}/{x}/{y}.png');
    });

    return () => {
      server.stop();
    };
  }, []);

  useEffect(() => {
    if (loggedIn) {
      downloadAndSaveTiles();
    }
  }, [loggedIn]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={position}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <UrlTile urlTemplate={tileServerUrl} />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
});

export default App;
