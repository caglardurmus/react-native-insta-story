export interface IUserStory {
  id: string;
  user_image: string;
  username: string;
  profilePic: string;
  vibes: IUserVibesItem[];
}

export interface IUserVibesMedia {
  type: string;
  url: string;
}

export interface IUserVibesLocation {
  coordinates: number[];
  type: string;
}

export interface IUserVibesItem {
  id: string;
  media: IUserVibesMedia;
  description?: string;
  location?: IUserVibesLocation;
  type?: string;
  address?: string;
  createdAt: string;
  onPress?: any;
  swipeText?: string;
}
