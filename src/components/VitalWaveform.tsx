import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VitalWaveformProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  maxVal?: number;
}

export const VitalWaveform: React.FC<VitalWaveformProps> = ({ 
  data, 
  color, 
  width = 300, 
  height = 80,
  maxVal = 200 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 5, right: 5, bottom: 5, left: 5 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, maxVal])
      .range([innerHeight, 0]);

    const line = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveBasis);

    // Add gradient
    const gradientId = `vital-gradient-${Math.random().toString(36).substr(2, 9)}`;
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0);

    // Area
    const area = d3.area<number>()
      .x((_, i) => x(i))
      .y0(innerHeight)
      .y1(d => y(d))
      .curve(d3.curveBasis);

    g.append("path")
      .datum(data)
      .attr("fill", `url(#${gradientId})`)
      .attr("d", area);

    // Line
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("d", line);

    // Add grid lines (horizontal)
    const yTicks = [maxVal * 0.25, maxVal * 0.5, maxVal * 0.75];
    g.selectAll(".grid-line")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-line")
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", d => y(d))
      .attr("y2", d => y(d))
      .attr("stroke", "currentColor")
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 0.1)
      .attr("stroke-dasharray", "2,2");

  }, [data, color, width, height, maxVal]);

  return (
    <svg 
      ref={svgRef} 
      width={width} 
      height={height} 
      className="overflow-visible"
    />
  );
};
