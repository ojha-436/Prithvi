import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaf } from "lucide-react";
import { StatCard } from "@/components/StatCard";

describe("StatCard", () => {
  it("renders label and value in the default inline layout", () => {
    render(<StatCard icon={Leaf} label="CO2 saved" value="120 kg" />);
    expect(screen.getByText("CO2 saved")).toBeInTheDocument();
    expect(screen.getByText("120 kg")).toBeInTheDocument();
  });

  it("renders the optional sub line in the stacked layout", () => {
    render(
      <StatCard icon={Leaf} label="Footprint" value="3.2 t" sub="CO2e per year" layout="stacked" />,
    );
    expect(screen.getByText("Footprint")).toBeInTheDocument();
    expect(screen.getByText("3.2 t")).toBeInTheDocument();
    expect(screen.getByText("CO2e per year")).toBeInTheDocument();
  });

  it("omits the sub line when not provided", () => {
    render(<StatCard icon={Leaf} label="Points" value="145" />);
    expect(screen.queryByText("CO2e per year")).not.toBeInTheDocument();
  });
});
