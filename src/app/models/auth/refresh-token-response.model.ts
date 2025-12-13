export interface RefreshTokenResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: string;
    roleName: string;
    createdDate: string;
    updatedDate: string;
  };
  token: string;
  refreshToken: string;
}

