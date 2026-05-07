import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import propertiesRouter from "./properties";
import tenantsRouter from "./tenants";
import paymentsRouter from "./payments";
import contractsRouter from "./contracts";
import maintenanceRouter from "./maintenance";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import externalRouter from "./external";
import catalogueRouter from "./catalogue";
import salesContractsRouter from "./salesContracts";
import venteAnalyticsRouter from "./venteAnalytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/dashboard", dashboardRouter);
router.use("/properties", propertiesRouter);
router.use("/tenants", tenantsRouter);
router.use("/payments", paymentsRouter);
router.use("/contracts", contractsRouter);
router.use("/maintenance", maintenanceRouter);
router.use("/notifications", notificationsRouter);
router.use("/analytics", analyticsRouter);
router.use("/external", externalRouter);
router.use("/catalogue", catalogueRouter);
router.use("/sales-contracts", salesContractsRouter);
router.use("/vente-analytics", venteAnalyticsRouter);

export default router;
