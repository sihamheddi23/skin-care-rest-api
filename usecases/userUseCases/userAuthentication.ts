import SessionRepository from "../../adapters/repositories/SessionRepository";
import UserRepository from "../../adapters/repositories/UserRepository";
import AppError from "../../frameworks/ServerConfig/utils/appError";
import { generate_token, verifyPassword } from "../../frameworks/ServerConfig/utils/auth";

class UserAuthentication {
  private userRepository: UserRepository;
  private sessionRepository: SessionRepository;

  constructor(userRepository: UserRepository, sessionRepository: SessionRepository) {
    this.userRepository = userRepository;
    this.sessionRepository = sessionRepository;
  }
    
  async execute(
    usernameOrEmailOrPhone: string,
    password: string,
  ) {
      
    const user = await this.userRepository.findUserByUsernameOrEmailOrPhone(
      usernameOrEmailOrPhone
    );

    if (!user) {
      throw new AppError("User not found", 401);
    }

    const isSamePassword = await verifyPassword(password, user.password);
    if (!isSamePassword) {
      throw new AppError("Password is wrong", 401);
    }

    // create session
    const sessionInput = {
      user_id: user.id,
    }
    const session = await this.sessionRepository.createSession(sessionInput);
 
    // generate token
    const payload = {
      session_id: session.id as number,
      username: user.username,
    }
    const token = generate_token(payload);
    
    // return token
    return token;
  }
}

export default UserAuthentication;
