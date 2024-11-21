"use client";

import * as d3 from "d3";
import { useEffect, useRef } from "react";

interface Bubble {
  id: string;
  value: number;
  label: string;
  fullname: string;
  percentage: string;
  percentChange24h: number;
  pl: number;
  tradeType: string;
}

interface BubblePackingProps {
  data: Bubble[];
}

export default function BubblePacking({ data }: BubblePackingProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 750; // 75% de largeur
    const height = 750; // 75% de hauteur

    const pack = d3.pack<Bubble>().size([width, height]).padding(20);

    const root = d3
      .hierarchy({ children: data })
      .sum((d) => d.value);

    const nodes = pack(root).leaves();

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const bubblesGroup = svg.append("g").attr("transform", `translate(0,0)`);

    bubblesGroup
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 0)
      .style("fill", (d) => {
        if (["airdrop", "stablecoin"].includes(d.data.tradeType)) {
          return "rgba(128,128,128,0.7)"; // Gris pour stablecoin et airdrop
        }
        return d.data.pl > 0
          ? "rgba(50,205,50,0.7)" // Vert si P/L positif
          : "rgba(255,69,0,0.7)"; // Rouge si P/L négatif
      })
      .style("stroke", (d) =>
        d.data.percentChange24h > 0
          ? "rgba(50,205,50,1)" // Vert pour change24h positif
          : "rgba(255,69,0,1)" // Rouge pour change24h négatif
      )
      .style("stroke-width", 3) // Contour épais
      .on("mouseover", function (event, d) {
        const tooltip = d3.select("#tooltip");
        tooltip
          .style("opacity", 1)
          .style("left", `${d.x + width / 2 - d.r}px`)
          .style("top", `${d.y - d.r - 10}px`)
          .html(() => {
            if (["airdrop", "stablecoin"].includes(d.data.tradeType)) {
              return `<strong>${d.data.fullname}</strong><br/>Value: $${d.data.value.toFixed(
                2
              )}<br/>Size: ${d.data.percentage}%`;
            }
            return `<strong>${d.data.fullname}</strong><br/>Value: $${d.data.value.toFixed(
              2
            )}<br/>Size: ${d.data.percentage}%<br/>P/L: ${d.data.plValue?.toFixed(
              2
            ) || "N/A"}$<br/>P/L: ${d.data.pl?.toFixed(
              2
            ) || "N/A"}%<br/>Change24h: ${d.data.percentChange24h?.toFixed(2) || "N/A"}%`;
          });
      })
      .on("mouseout", () => {
        d3.select("#tooltip").style("opacity", 0);
      })
      .call((enter) =>
        enter.transition().duration(750).attr("r", (d) => d.r)
      );

    bubblesGroup
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .style("text-anchor", "middle")
      .style("fill", "#fff")
      .style("font-size", (d) => `${Math.max(d.r / 4, 12)}px`)
      .style("pointer-events", "none")
      .text((d) => d.data.label);
  }, [data]);

  return (
    <div className="relative flex justify-center items-center w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 750 750"
        preserveAspectRatio="xMidYMid meet"
        className="w-[90%] h-[90%]"
      />
      <div
        id="tooltip"
        className="absolute bg-black text-white text-sm p-2 rounded shadow-lg pointer-events-none opacity-0 transition-opacity duration-300"
        style={{
          whiteSpace: "nowrap",
          transform: "translate(-50%, 0)",
        }}
      />
    </div>
  );
}
