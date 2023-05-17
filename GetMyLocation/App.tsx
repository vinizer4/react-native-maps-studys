import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';

const tilesDirectory = `${FileSystem.documentDirectory}osm_tiles`;

async function downloadAndSaveTiles() {
  // Crie a estrutura de diretórios para os tiles
  await FileSystem.makeDirectoryAsync(`${tilesDirectory}/z`, { intermediates: true });

  // Baixe os tiles e salve-os no armazenamento local
  // Substitua a URL pela URL real do tile OpenStreetMap que você deseja baixar
  const tileUrl = 'https://tile.openstreetmap.org/z/x/y.png';

  const localTilePath = `${tilesDirectory}/z/x/y.png`;

  // Baixe e salve o tile
  await FileSystem.downloadAsync(tileUrl, localTilePath);
}

const App = () => {
  const [position, setPosition] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [tileServerUrl, setTileServerUrl] = useState('');

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
    const localTileUrl = `${tilesDirectory}/{z}/{x}/{y}.png`;
    setTileServerUrl(localTileUrl);

    downloadAndSaveTiles();
  }, []);

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

 export default React.memo(App);
