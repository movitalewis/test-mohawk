import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../services/home.service';
import { faStar, faStarHalfAlt, faStar as faStarOutline } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: "app-edge-dashboard",
    templateUrl: "./edge-dashboard.component.html",
    styleUrls: ["./edge-dashboard.component.scss"],
    standalone: false
})
export class EdgeDashboardComponent implements OnInit {
  faStar = faStar;
  faStarHalfAlt = faStarHalfAlt;
  faStarOutline = faStarOutline;
  trackingData: any;
  saleValue = 0;
  reviews: any;
  rewards: any;
  sales: any;
  isReadOnly = false;
  salesGoals: any;
  currentSales: any;
  previousyearNetSales: any;
  previousYear: any;
  previousYearDesc: any;

  edgeLogo: any;
  spinnerLoading = false;
  edgeDashboardNetSales: any = "";
  constructor(private homeService: HomeService) {}
  ngOnInit(): void {
    this.edgeTrackingData();
    this.getEdgeDashboardNetSales();
  }
  edgeTrackingData() {
    this.spinnerLoading = true;
    this.homeService.getEdgeTrackingDetails().subscribe((data) => {
      this.trackingData = data?.body;
      this.reviews = this.trackingData?.edgeReviewsResponseData;
      this.rewards = this.trackingData?.edgeRewardsResponseData;
      this.sales = this.trackingData?.edgeSalesTrackingData;
      this.previousYear = this.trackingData?.previousYear;
      this.previousYearDesc = this.trackingData?.previousYearDesc;
      this.edgeLogo = this.trackingData?.edgeLogo;
      this.spinnerLoading = false;
      if (this.sales) {
        this.salesGoals = [
          {
            amount: this.sales.memberGoal,
            label: "Member",
            round: this.sales.memberGoalRound,
          },
          {
            amount: this.sales.preferredGoal,
            label: "Preferred",
            round: this.sales.preferredGoalRound,
          },
          {
            amount: this.sales.selectGoal,
            label: "Select",
            round: this.sales.selectGoalRound,
          },
          {
            amount: this.sales.premierGoal,
            label: "Premier",
            round: this.sales.premierGoalRound,
          },
        ];
        this.currentSales = this.sales.totalSalesProgress;
        this.previousyearNetSales = this.sales.previousYearSales;
        //this.currentSales = this.sales.totalSalesProgress;
      }
    });
  }
  getVerticalPosition(amount: number): string {
    const maxGoal = this.salesGoals[this.salesGoals.length - 1].amount;
    if (amount === maxGoal) {
      return `90%`;
    }
    return `${(amount / maxGoal) * 100 + 1}%`;
  }
  getStarIcon(index: number): any {
    const rating = this.reviews?.rating || 0;
    if (index < Math.floor(rating)) {
      return this.faStar;
    } else if (index < rating) {
      return this.faStarHalfAlt;
    } else {
      return this.faStarOutline;
    }
  }
  getStarClass(index: number): string {
    const rating = this.reviews?.rating || 0;
    if (index < rating) {
      return "checked";
    }
    return "";
  }

  getClampedPosition(value: number, maxValue: number): string {
    if (value === 0) return "0%";
    if (!value || !maxValue || value > maxValue) return "100%";
    const position = (value / maxValue) * 100;
    return `${position}%`;
  }

  getnetClampedPosition(value: number): string {
    if (!this.salesGoals || this.salesGoals.length === 0) return "1%";

    if (value === 0) return "1%";

    const totalMilestones = this.salesGoals.length;
    const maxGoal = this.salesGoals[totalMilestones - 1].amount;
    if (value >= maxGoal) return "100%";
    if (value <= this.salesGoals[0].amount) {
      const firstMilestone = this.salesGoals[0].amount;
      const progress = (value / maxGoal) * 100;
      return `${progress}%`;
    }
    for (let i = 0; i < totalMilestones - 1; i++) {
      const start = this.salesGoals[i].amount;
      const end = this.salesGoals[i + 1].amount;

      if (value >= start && value <= end) {
        const rangePosition =
          ((value - start) / (end - start)) * (100 / (totalMilestones - 1));
        const cumulativePosition = (i / (totalMilestones - 1)) * 100;
        return `${cumulativePosition + rangePosition - 10}%`;
      }
    }

    return "100%";
  }

  getEdgeDashboardNetSales() {
    this.homeService.getEdgeDashboardNetSales().subscribe((res) => {
      this.edgeDashboardNetSales = res;
    });
  }

  isLabelOverlapping(): boolean {
    if (!this.sales?.totalSalesProgress || !this.sales?.premierGoal) return false;
    const percentage = (this.sales.totalSalesProgress / this.sales.premierGoal) * 100; 
    return percentage >= 10;
  }
  
}
