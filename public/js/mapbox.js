
export const displayMap = (locations) =>{
    mapboxgl.accessToken = 'pk.eyJ1IjoiYW1rYXMiLCJhIjoiY2tkd296cjRpMHR6cTJyb2dybXRoNnRiOCJ9.kXj6XxE56FsK9WR2gy9Zmw';


    var map = new mapboxgl.Map({
       container: 'map',
       style: 'mapbox://styles/amkas/cke5iu32g1ixr1arq80qosr36',
       scrollZoom:false
       // center : [-118.113491 , 34.111745],
       // zoom :4,
       // interactive : false
     });
   
   const bounds = new mapboxgl.LngLatBounds();
   
   locations.forEach(loc => {
       //create marker
       const el = document.createElement('div');
       el.className ='marker';
       //add marker
       new mapboxgl.Marker({
           element : el,
           anchor : 'bottom'
       }).setLngLat(loc.coordinates).addTo(map);
       //pop up
   
       new mapboxgl.Popup({offset:30}).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`).addTo(map);
       //extends the map bounds to include current location
       bounds.extend(loc.coordinates);
   });
   
   map.fitBounds(bounds,{
       padding:{
       top:200,
       bottom : 50,
       left: 100,
       right:100
       }
   });


};

