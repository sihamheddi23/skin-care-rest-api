import dbConnect from "../../frameworks/DBConfig";
import { NextFunction, Request, Response } from "express";
import CompanyRepository from "../repositories/CompanyRepository";
import UserRepository from "../repositories/UserRepository";
import CompanyAddOrUpdate from "../../usecases/companyUsesCases/companyAddOrUpdate";
import AppError from "../../frameworks/ServerConfig/utils/appError";
import { verifyImage } from "../../frameworks/ServerConfig/utils/files";

class CompanyController {
  private companyRepository: CompanyRepository;
  private userRepository: UserRepository;
 
  constructor() {
    const db = dbConnect.manager;
    this.companyRepository = new CompanyRepository(db);
    this.userRepository = new UserRepository(db);
  }

  async add(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { userId } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    //console.log(files);
    
    try {
      const hasLogoProperty = "logo" in files;
      if (!hasLogoProperty) {
        throw new AppError("No file uploaded",400);
      }

      const logo = files["logo"][0];
      const logo_url = verifyImage(logo);
 
      await this.userRepository.findUserById(userId);
      const addCompanyUseCase = new CompanyAddOrUpdate(this.companyRepository);
      const company = await addCompanyUseCase.execute("ADD", { ...req.body, logo_url });
      
      res.status(200).send(company);
    } catch (error) {
      next(error);
    }
  }
  
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] }
    try {
      const usecaseParameter = {
        ...req.body,
        id: +id
      }
      const hasLogoProperty = "logo" in files;
      if (hasLogoProperty) {
        const logo = files["logo"][0];
        const logo_url = verifyImage(logo);

        usecaseParameter.logo_url = logo_url;
      }

      await this.companyRepository.findCompanyById(+id);
      const updateCompanyUseCase = new CompanyAddOrUpdate(this.companyRepository);
      const company = await updateCompanyUseCase.execute("UPDATE", usecaseParameter);
      
      res.status(200).send(company);
    } catch (error) {
      next(error);
    }
  }
}

export default CompanyController;
