import {
	Component,
	Input,
	Output,
	EventEmitter,
} from "@angular/core";
import { FlyoutService } from "@acpaas-ui/ngx-components/flyout";


@Component({
	selector: "user-flyout",
	templateUrl: "user-flyout.component.html",
	styleUrls: [
		"user-flyout.component.scss",
	],
})
export class UserFlyoutComponent {
	@Input() public user: any;
	@Output() login: EventEmitter<any> = new EventEmitter<any>();
	@Output() logout: EventEmitter<boolean> = new EventEmitter<boolean>();

	constructor(
		private flyoutService: FlyoutService,
	) { }

	public loginUser(): void {
		this.login.emit(null);
	}

	public logoutUser(): void {
		this.flyoutService.close();
		this.user = null;
		this.logout.emit(true);
	}

}