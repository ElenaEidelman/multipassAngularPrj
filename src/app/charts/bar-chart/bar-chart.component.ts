import { Component, Input, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label } from 'ng2-charts';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {

  @Input() chartTitle: string;
  @Input() chartColor: string;
  @Input() chartData: ChartDataSets[]; 
  @Input() chartLabels: Label[];


  public barChartOptions: ChartOptions = {
    responsive: true,

    // maintainAspectRatio: false,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{
                        // barPercentage: 0.2,
                        gridLines: {
                          display: false
                        }
                      }], 
              yAxes: [{
                        ticks: {
                          beginAtZero: true,
                          
                          },
                }] 
              },
    plugins: {
      datalabels: {
        anchor: 'start',
        align: 'end',
      }
    }
    
  };

  barChartColors: Color[];
  
  public barChartLabels: Label[];
  public barChartData: ChartDataSets[];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];


  constructor() { }
  

  ngOnInit(): void {
    if(this.chartData != undefined && this.chartLabels != undefined){
      this.barChartData = this.chartData;
      this.barChartLabels = this.chartLabels;
      this.setColorForChart();
    }
  }

  setColorForChart(){
    this.barChartColors  = [
        {
          backgroundColor: this.chartColor == undefined ? 'rgba(64,59,59, 0.6)' : this.chartColor,
        },
      ];
  }
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

}
