import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapData: [],
      meteorData: []
    };
    this.fetchMapData();
    this.fetchMeteorData = this.fetchMeteorData.bind(this);
    this.createMap = this.createMap.bind(this);
  }

  fetchMapData() {
    const API = 'https://d3js.org/world-50m.v1.json';

    d3.json(API, (error, json) => {
      if (error) throw error;

      this.setState({
        mapData: json
      }, this.fetchMeteorData);
    });
  }

  fetchMeteorData() {
    const METEOR_API = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';

    d3.json(METEOR_API, (error, json) => {
      if (error) throw error;

      this.setState({
        meteorData: json
      }, this.createMap);
    })
  }

  createMap() {
    const { mapData, meteorData } = this.state;

    const svg = d3.select('.canvas')
                  .append('svg')
                  .attr('width', '100%')
                  .attr('height', 850);

    const projection = d3.geoMercator()
                         .scale(210)
                         .translate([620,450])

    const path = d3.geoPath()
                   .projection(projection);

    svg.selectAll('path')
       .data(topojson.feature(mapData, mapData.objects.countries).features)
       .enter()
       .append('path')
       .attr('fill', '#ffe0aa')
       .attr('stroke', '#266D98')
       .attr('d', path);

    const minMass = d3.min(meteorData.features, d => {
      return parseFloat(d.properties.mass);
    });

    const maxMass = d3.max(meteorData.features, d => {
      return parseFloat(d.properties.mass);
    });


    const rScale = d3.scaleLinear()
                     .domain([minMass, maxMass])
                     .range([1, 50]);


    // const massArr = meteorData.features.sort((a, b) => {
    //   return b.properties.mass - a.properties.mass;
    // });
    //
    // console.log(massArr);

    const div = d3.select('.canvas')
                  .append('div')
                  .attr('class', 'tooltip')
                  .attr('opacity', 0);

    svg.selectAll('path')
       .data(meteorData.features)
       .enter()
       .append('circle')
       .attr('cursor', 'pointer')
       .attr('fill', '#ff4444')
       .attr('opacity', 0.6)
       .attr('stroke', 'white')
       .attr('cx', d => {
         return projection([d.properties.reclong, d.properties.reclat])[0];
       })
       .attr('cy', d => {
         return projection([d.properties.reclong, d.properties.reclat])[1];
       })
       .attr('r', d => {

        //  if (d.properties.mass) {
        //    d.properties.mass = parseFloat(d.properties.mass);
        //  }
        //  return rScale(d.properties.mass);

        var range = 718750/2/2;

        if (d.properties.mass <= range) return 2;
        else if (d.properties.mass <= range*2) return 10;
        else if (d.properties.mass <= range*3) return 20;
        else if (d.properties.mass <= range*20) return 30;
        else if (d.properties.mass <= range*100) return 40;
        return 50;
       })
       .on('mouseover', function(d) {

          div.style('opacity', 0.9);

         div.html(`<strong>Name:</strong> ${d.properties.name}<br><strong>Mass:</strong> ${d.properties.mass}<br><strong>Year:</strong> ${d.properties.year.slice(0,4)}`)
         .style('left', `${d3.event.pageX}px`)
         .style('top', `${d3.event.pageY}px`);
       })
       .on('mouseout', function(d) {

          div.style('opacity', 0);
       });

    svg.append('text')
       .attr('x', 50)
       .attr('y', 500)
       .text(`The Meteor Map`)
       .attr('class', 'title');

    svg.append('text')
       .attr('x', 50)
       .attr('y', 520)
       .text('Across The Globe')
       .attr('class', 'subtitle');

  }



  render() {
    return(
      <div className='canvas'></div>
    )
  }
}
